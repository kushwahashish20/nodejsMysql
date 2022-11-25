const {S3Path, QCS3Paths, S3Util} = require('../util/s3-utils');
const middy = require('@middy/core');
const {Logger} = require('@aws-lambda-powertools/logger');
const {attachJobIdToLogger} = require("../util/logger-utils");
const SellerPlatform = require("../util/seller-platform");
const sqsUtils = require('../../sqs_utils');
const logger = new Logger();
const executeRulesUtils = require("../rule-engine/execute-rules-util");
const {JobExecution, ExecutionStats} = require("../rule-engine/execute-rules-util");
const {Overview, TabDetail, CategoryReport, FrontendReport, Detail, DetailedReport, ListingScore, ListingDetails} = require("../models/detailed-report");
const {JSONUtils} = require("../util/json-utils");
const {MimeTypes} = require("../util/mime-types");
const {extractImagesMiddy, fetchRulesMiddy} = require("../middy/middies");
const {FinalImageData} = require("../models/final-image-data");
const {LookupValueUtil} = require('../util/lookup-value-util');
/**
 * *
 * @param event
 * @param images{ImageEntryModel[]}
 * @param rules{Rules}
 * @return {Promise<JSON>}
 */
let handler = async (event, {rules, images} = context) => {
  logger.info("Running lambda with event: ", event);

  let platformName = event.platform_name;
  let listingRules = event.listing_rules;
  let jobId = event.job_id;
  let listingDetails = new ListingDetails(event.listing_details);

  // Merge all the analyzers data into one and group it via images
  /**
   *
   * @type {*[]}
   */
  let finalImageData = await executeRulesUtils.groupByImages(event.input);
  logger.debug("Merged JSON for images and analyzers: ", finalImageData);

  /**
   *
   * @type {FinalImageData[]}
   */
  let classFinalImageData = []
  //pushing FinalImageData class object to the array classFinalImageData
  finalImageData.forEach((imageData) => {
    classFinalImageData.push(new FinalImageData(imageData));
  });
  const executions = [];
  // Prepare and execute the rules for each image in parallel
  classFinalImageData.forEach((finalImageData) => {
    executions.push(executeRulesUtils.executeRules(finalImageData, listingDetails));
  })
  /**
   *
   * @type {Map<String, Map<String, ReportRule>>[]}
   */
  const ruleExecutions = await Promise.all(executions);
  logger.debug("Rules executed and the returned array is", ruleExecutions);

  // Execute Listing Rules after image rules are compleed
  let listingRulesExecutionResults = await executeRulesUtils.executeListingRules(classFinalImageData,listingRules, platformName, images, listingDetails);

  let jobExecution = new JobExecution();
  jobExecution.setImageToRuleResultsExecutions(ruleExecutions);
  jobExecution.generateImageToComplianceLevelResults();
  jobExecution.setListingRulesExecutionResults(listingRulesExecutionResults.rule_execution_result);
  jobExecution.setDetailReportListingRules(listingRulesExecutionResults.listing_rules_result)
  // After all executions are done, prepare the frontend report
  let finalFrontendReport = await prepareFrontendReport(jobId, images, ruleExecutions, rules, jobExecution, platformName);

  // Since the report is in JS object, we'll need to convert it to JSON
  let finalFrontendReportJSON = await JSONUtils.getJSONFromJavascriptObject(finalFrontendReport);

  logger.info("Final Frontend Report being saved to S3", finalFrontendReportJSON);

  let s3_final_report_key = await uploadReportToS3(finalFrontendReportJSON, jobId);
  let jobStatus = "SUCCESS";
  if (s3_final_report_key == null) {
    jobStatus = "ERROR";
  }
  const sqsInput = {
    job_id: jobId,
    report_s3_key: s3_final_report_key,
    job_status: jobStatus
  }

  /**
   *
   * @type {String}
   */
  let sqsResponse = await sqsUtils.sendReportToSqs(sqsInput, process.env.QC_JOB_COMPLETE_NOTIFIER_QUEUE_URL);
  logger.info("SQS Message ID ", sqsResponse);
  return finalFrontendReportJSON;
};


/**
 *
 * @param finalReport
 * @param event
 * @returns {Promise<*>}
 */
async function uploadReportToS3(finalReport, jobId) {
  logger.debug(" uploadReportToS3() with finalReport : ", finalReport);
  let report = JSON.stringify(finalReport);
  const input = Buffer.from(report);
  let reportPathKey = "qc/private/_job_id/" + jobId + "/output/report/final_report.json";
  /**
   *
   * @type {S3Path}
   */
  let s3Path = S3Path.create(QCS3Paths.getBucket(), reportPathKey);

  /**
   *
   * @type {ManagedUpload.SendData}
   */
  let s3ObjectDetails = await S3Util.putObjectToS3(input, s3Path, MimeTypes.JSON);
  logger.debug(" after uploading report to S3 the final keys: ", s3ObjectDetails);
  return s3Path.key;
}

const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {});

/**
 *
 * @param jobExecutionResults {Map<String, Map<String, ReportRule>>[]}
 * @param {Rules} rules
 * @param {JobExecution} jobExecution
 * @param {string} platformName
 * @returns {Promise<[]>}
 */
async function createDetailedReportDataAndExtractListingScore(jobExecutionResults, rules, jobExecution, platformName) {
  logger.debug("Initializing group by on rule", jobExecutionResults);
  jobExecutionResults.push(jobExecution.getDetailReportListingRulesExecutionResults());
  /**
   *
   * @type {DetailedReport[]}
   */
  let detailedReportData = [];

  /**
   *  @type {Map<string, ExecutionStats>}
   */
  let displayReportCategoryStats = new Map();

  let imageToExecutionStats = new Map();
  let imageToDisplayReportCategoryStats = new Map();
  let imageToDetailedReport = new Map();

  // Outer loop for each image
  jobExecutionResults.forEach(imageExecutionResult => {
    let keys = imageExecutionResult.keys();
    let imageKey = keys.next().value;

    /**
     *
     * @type {MarketPlace}
     */
    let marketPlace = rules.getMarketPlace(platformName);

    /**
     *
     * @type {Map<string, Array<string>>}
     */
    let displayReportCategoryToRules = marketPlace.getDisplayReportCategoryToRuleMapping();

    /**
     *
     * @type {string[]}
     */
    let displayReportCategoryIds = [...displayReportCategoryToRules.keys()];

    /**
     *
     * @type {Map<String, ReportRule>}
     */
    let currentImageExecution = imageExecutionResult.get(imageKey);
    let categoryWiseRuleResultsObject = {};

    // Category Level Loop
    displayReportCategoryIds.forEach((displayReportCategoryId) => {
      /**
       *
       * @type {Array<string>}
       */
      let ruleIds = displayReportCategoryToRules.get(displayReportCategoryId);

      /**
       * @type {ReportRule[]}
       */
      let currentCategoryGroup = categoryWiseRuleResultsObject[displayReportCategoryId];
      ruleIds.forEach((ruleId) => {
        if (currentCategoryGroup === undefined) {
          currentCategoryGroup = []
        }
        let ruleResult = currentImageExecution.get(ruleId)
        if (ruleResult !== undefined) {
          currentCategoryGroup.push(ruleResult);
        }
      })
      if (currentCategoryGroup.length != 0) {
        categoryWiseRuleResultsObject[displayReportCategoryId] = currentCategoryGroup;
      }

    })

    /**
     *
     * @type {CategoryReport[]}
     */
    let imageExecutionResultsData = [];
    /**
     * @type {number}
     */
    let imageRulesFailedCount = 0;

    let categoryToExecutionStats = new Map();

    // Category Level Loop
    displayReportCategoryIds.forEach(categoryId => {

      displayReportCategoryStats.has(categoryId);

      /**
       *
       * @type {string[]}
       */
      let failedRuleIds = [];

      /**
       * @type{ReportRule[]}
       */
      let currentCategoryGroup = categoryWiseRuleResultsObject[categoryId];

      /**
       *
       * @type {number}
       */
      let displayCategoryRulesFailedCount = 0;

      // Second Level Group By
      let categoryAndComplianceWishRules;
      /**
       *
       * @type {string[]}
       */
      let complianceLevelNames

      /**
       *
       * @type {TabDetail[]}
       */
      let tabDetails = [];

      let successFulRules = [];
      if (currentCategoryGroup !== undefined) {
        categoryAndComplianceWishRules = groupBy(currentCategoryGroup, v => v.getComplianceLevel());
        complianceLevelNames = Object.keys(categoryAndComplianceWishRules);

        //Prepare Tab Details Level of JSON
        complianceLevelNames.forEach(complianceLevel => {

          /**
           * @type {ReportRule[]}
           */
          let results = categoryAndComplianceWishRules[complianceLevel];
          /**
           *
           * @type {Detail[]}
           */
          let details = [];

          results.forEach(result => {
            /**
             * @type{string}
             */
            let currentRuleId = result.getRuleId();

            /**
             * @type{Boolean}
             */
            let ruleResult = result.getResult();

            /**
             *
             * @type {number}
             */
            let actualValue = result.getActualValue();

            /**
             *
             * @type {number}
             */
            let expectedValue = result.getExpectedValue();

            /**
             *
             * @type {string}
             */
            let executionMessage = result.getExecutionMessage();

            /**
             *
             * @type {number}
             */
            let rulePotentialScoreChange = 0;
            // If the rule failed then update the potential score change, else it'll be 0
            if (ruleResult === false) {
              rulePotentialScoreChange = marketPlace.getPotentialScoreForRuleId(currentRuleId);
            }

            /**
             *
             * @type {Detail}
             */
            let currentDetail = new Detail(ruleResult, currentRuleId, rulePotentialScoreChange, actualValue, expectedValue, executionMessage);

            if (ruleResult === false) {
              failedRuleIds.push(currentRuleId)
              imageRulesFailedCount++;
              displayCategoryRulesFailedCount++;
              details.push(currentDetail);
            } else {
              successFulRules.push(currentDetail);
            }

          })
          if (details.length != 0) {
            /**
             *
             * @type {TabDetail}
             */
            let tabDetail = new TabDetail(complianceLevel, details);

            tabDetails.push(tabDetail);
          }
        })
      }
      if (successFulRules.length != 0) {
        // Success Tab Details
        tabDetails.push(new TabDetail("successful_criteria", successFulRules))
      }

      let potentialScoreForCategory = countPotentialScoreForCategory(failedRuleIds, marketPlace);

      let actualScoreForCategory = countActualScoreForCategory(potentialScoreForCategory);
      if (tabDetails.length != 0) {
        /**
         *
         * @type {CategoryReport}
         */
        let categoryReport = new CategoryReport(categoryId, tabDetails, actualScoreForCategory, potentialScoreForCategory);

        let currentCategoryGroupLength = currentCategoryGroup === undefined ? 0 : currentCategoryGroup.length
        categoryToExecutionStats.set(categoryId, new ExecutionStats(currentCategoryGroupLength, displayCategoryRulesFailedCount, failedRuleIds, actualScoreForCategory, potentialScoreForCategory));

        imageExecutionResultsData.push(categoryReport)
      }
    });

    let imageId = imageKey.substring(imageKey.lastIndexOf('/') + 1).split('.')[0];
    /**
     *
     * @type {DetailedReport}
     */
    let detailedReportForImage = new DetailedReport(imageId, imageRulesFailedCount, imageExecutionResultsData);

    imageToExecutionStats.set(imageId, new ExecutionStats(currentImageExecution.size, imageRulesFailedCount));
    imageToDisplayReportCategoryStats.set(imageId, categoryToExecutionStats);
    imageToDetailedReport.set(imageId, detailedReportForImage);

    jobExecution.setImageToDisplayReportStats(imageToExecutionStats);
    jobExecution.setImageToDisplayReportCategoryStats(imageToDisplayReportCategoryStats);
    jobExecution.setImageToDetailedReport(imageToDetailedReport);

    detailedReportData.push(detailedReportForImage);

  });

  return detailedReportData;
}

/**
 *
 * @param {strin[]} failedRuleIds
 * @param {MarketPlace} marketPlace
 * @param {number} totalRulesInCategoryCount
 * @returns {number}
 */
function countPotentialScoreForCategory(failedRuleIds, marketPlace, totalRulesInCategoryCount) {

  // LOGIC => Get the weightage of the rule in the category, add the weightage
  // to get the potential score
  // If no failed rules, then potential score is 0
  // If all failed rules, then potential score is 100

  let failedScore = 0
  failedRuleIds.forEach(ruleId => {
    failedScore += Math.round(marketPlace.getPotentialScoreForRuleId(ruleId));
  })
  let potentialScore = 0
  //All fail
  if (totalRulesInCategoryCount === failedRuleIds.length) {
    potentialScore = 100
  } else {
    potentialScore = Math.round(failedScore);
  }
  return potentialScore;
}

/**
 *
 * @param {number} potentialScoreForCategory
 * @returns {number}
 */
function countActualScoreForCategory(potentialScoreForCategory) {
  return 100 - potentialScoreForCategory;
}

/**
 *
 * @param {string} jobId
 * @returns {Promise<*>}
 */
async function getProductListingDetailsFromS3(jobId) {
  /**
   *
   * @type {S3Path}
   */
  let fileToStoreRainforestResultFile = QCS3Paths.getFileToStoreRainforestResultFile(jobId);
  let rainforestResponse = await S3Util.getObjectAsJson(fileToStoreRainforestResultFile);
  return rainforestResponse;
}

/**
 *
 * @param productListingFromRainforest
 * @param images{ImageEntryModel[]}
 * @returns {Promise<Overview>}
 */
async function getOverviewObjectFromProductListingDetails(productListingFromRainforest, images) {
  return Overview.getOverviewForAmazon(productListingFromRainforest, images);
}

async function createImageIdToUrlMap(images) {
  /**
   *
   * @type {Map<string, string>}
   */
  let imageIdToUrlMap = new Map();
  images.forEach(image => {
    imageIdToUrlMap.set(image.image_id, image.s3_key);
  })
  return imageIdToUrlMap;
}

/**
 *
 * @param {string} jobId
 * @param images{ImageEntryModel[]}
 * @param ruleExecutions {Map<String, Map<String, ReportRule>>[]}
 * @param {Rules} rules
 * @param {JobExecution} jobExecution
 * @param {string} platformName
 * @returns {Promise<FrontendReport>}
 */
async function prepareFrontendReport(jobId, images, ruleExecutions, rules, jobExecution, platformName) {
  let detailedReport = await createDetailedReportDataAndExtractListingScore(ruleExecutions, rules, jobExecution, platformName);
  let rainforestResponse = await getProductListingDetailsFromS3(jobId);
  /**
   * @type {Overview}
   */
  let overview = await getOverviewObjectFromProductListingDetails(rainforestResponse, images);

  /**
   * @type {ListingScore}
   */
  let listingScore = await jobExecution.generateListingScoreForImages(rules, platformName);

  /**
   * @type {ScoreByImage}
   */
  let scoreByImages = await jobExecution.getScoreByImages(rules, platformName).getScoreByImageArray();


  /**
   *
   * @type {Map<String, String>}
   */
  let imageIdToUURLMap = await createImageIdToUrlMap(images);

  // Creating an object from the received map as JSON.stringify doesn't support map and we would require JSON.stringify for converting final report to JSON
  /**
   *
   * @type {JSON}
   */
  let imageIdToURLObject = Object.fromEntries(imageIdToUURLMap);
  /**
   *
   * @type {FrontendReport}
   */
  let frontendReport = new FrontendReport(overview, listingScore, detailedReport, scoreByImages, imageIdToURLObject);
  return frontendReport;
}

exports.handler = middy()
  .use(attachJobIdToLogger(logger))
  .use(fetchRulesMiddy())
  .use(extractImagesMiddy())
  .handler(handler);
