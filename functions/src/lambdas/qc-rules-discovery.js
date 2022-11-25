const middy = require('@middy/core');

const AWS = require('aws-sdk');
const s3Client = new AWS.S3();
let Rules = require("../rule-engine/rule-utils.js").Rules;
const fetchRulesUtils = require('../rule-engine/fetch-rules-utils.js');
const {getObjectFromS3} = require('../util/s3-utils.js');
const {QCS3Paths, S3Util} = require("../util/s3-utils");
const {Logger} = require('@aws-lambda-powertools/logger');
const {attachJobIdToLogger} = require("../util/logger-utils");
const {ImageType, ImageEntryModel, RuleApplicability} = require("../rule-engine/rule-utils");
const {extractImagesMiddy, fetchRulesMiddy} = require("../middy/middies");
const logger = new Logger();


/**
 * *
 * @param event
 * @param rules{Rules}
 * @param images{ImageEntryModel[]}
 */
let handler = async (event, {rules, images} = context) => {
  //noinspection JSCheckFunctionSignatures
  logger.info("Running lambda with event.", {event: event});
  let categoryName = event.category_name;
  let listingName = RuleApplicability.toEnum("listing");
  let listingRules = await fetchRulesUtils.getListingRules(rules, listingName);
  //converting map to json object
  let listingRulesObject = [...listingRules.values()]
  const matchedRules = [];
  for (let i = 0; i < images.length; i++) {
    let image = images[i];
    let imageType = ImageType.toEnum(image.image_type);
    /**
     *
     * @type {Map<string, Rule[]>}
     */
    let marketPlaceToRules = await fetchRulesUtils.rulesDiscovery(rules, categoryName, imageType);

    for (const marketPlaceName of marketPlaceToRules.keys()) {
      const rulesArray = marketPlaceToRules.get(marketPlaceName);
      matchedRules.push({
        image_key: image.s3_key,
        image_rules: rulesArray,
        marketPlaceName: marketPlaceName
      });
    }
  }
  //noinspection JSCheckFunctionSignatures
  logger.debug("Total rules collected. Count:" + matchedRules.length)
  logger.debug("Grouping the rules by analyzers");
  /**
   * *
   * @type {AnalyzerEntryModel[]}
   */
  let analyzersResponse = fetchRulesUtils.analyzersFromRules(matchedRules, event.job_id);
  //noinspection JSCheckFunctionSignatures
  logger.debug("After grouping rules by analyzers as:", {analyzersResponse: analyzersResponse});
  return {
    statusCode: 200,
    listing_details: event.listing_details,
    rules: matchedRules,
    image_s3_keys: event.image_s3_keys,
    analyzers: analyzersResponse,
    images: images,
    listing_rules: listingRulesObject,
    job_id: event.job_id,
    platform_name: event.platform_name
  };
};

/**
 *
 * @param {*} event Event object
 * @returns {JSON} metadata for image
 */
exports.handler = middy()
  .use(attachJobIdToLogger(logger))
  .use(fetchRulesMiddy())
  .use(extractImagesMiddy())
  .handler(handler);