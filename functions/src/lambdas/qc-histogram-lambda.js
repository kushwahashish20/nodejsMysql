const middy = require('@middy/core');
const {getObjectFromS3, S3Path, QCS3Paths} = require('../util/s3-utils.js');
const AnalyzerResultForImage = require("../models/analyzer-result-response");
const {JSONUtils} = require("../util/json-utils");
const {Logger} = require('@aws-lambda-powertools/logger');
const {attachJobIdToLogger} = require("../util/logger-utils");
const logger = new Logger();
const histogram = require("../analyzers/histogram.js");

/**
 *
 * @param event{*} AWS Event object
 * @returns {JSON} analyzer result for histogram
 */
let handler = async (event) => {
  logger.info("Running lambda with event: ", event);
  /**
   *
   * @type {Promise<AnalyzerResultForImage>[]}
   */
  const executions = [];
  for (let i = 0; i < event.input.image_s3_keys.length; i++) {
    executions.push(processHistogramAnalyzerForImageKey(event.input.image_s3_keys[i]));
  }
  /**
   *
   * @type {AnalyzerResultForImage[]}
   */
  const histogramResultsForImages = await Promise.all(executions);
  logger.debug("histogram analyzer successful now parsing it to JSON");

  /**
   *
   * @type {JSON}
   */
  let response = JSONUtils.getJSONFromJavascriptObject(histogramResultsForImages);
  logger.info("histogram result for images in JSON format", response);


  let finalResponse = {
    statusCode: 200,
    job_id: event.job_id,
    body: response,
    analyzer_name: event.input.analyzer_name,
    rules: event.rules
  }
  return finalResponse;
}

/**
 *
 * @param {string} imageKey
 * @returns {Promise<AnalyzerResultForImage>}
 */
async function processHistogramAnalyzerForImageKey(imageKey) {
  /**
   *
   * @type {S3Path}
   */
  let s3Path = S3Path.create(QCS3Paths.getBucket(), imageKey);

  logger.debug("Getting Image from S3 path", s3Path);
  /**
   *
   * @type {S3.GetObjectOutput}
   */
  let s3Object = await getObjectFromS3(s3Path);

  /**
   *
   * @type {boolean}
   */
  let isWhiteBackground = await histogram.detectWhiteBackground(s3Object.Body, undefined);
  /**
   *
   * @type {{is_white_background: boolean}}
   */
  let analyzerResult = {
    is_white_background: isWhiteBackground.toString()
  }

  return new AnalyzerResultForImage(imageKey, analyzerResult);
}

/**
 *
 * @param {*} event Event object
 * @returns {JSON} metadata analyzer result for images
 */
exports.handler = middy()
  .use(attachJobIdToLogger(logger))
  .handler(handler);