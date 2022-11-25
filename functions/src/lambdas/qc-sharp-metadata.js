const middy = require('@middy/core');

const sharpUtils = require("../analyzers/sharp-utils.js");
const {getObjectFromS3, S3Path, QCS3Paths} = require('../util/s3-utils.js');
const AnalyzerResultForImage = require("../models/analyzer-result-response");
const {JSONUtils} = require("../util/json-utils");
const {Logger} = require('@aws-lambda-powertools/logger');
const {attachJobIdToLogger} = require("../util/logger-utils");
const {extractAnalyzerInput} = require("../middy/middies");
const logger = new Logger();

/**
 *
 * @param event{*} AWS Event object
 * @param analyzerEntryModel{AnalyzerEntryModel}
 * @returns {JSON} metadata for image
 */
let handler = async (event, {analyzerEntryModel} = context) => {
  logger.info("Running lambda with event: ", event);
  /**
   *
   * @type {Promise<Metadata>[]}
   */
  const executions = [];
  /**
   * *
   * @type {string[]}
   */
  let images = analyzerEntryModel.image_s3_keys;
  for (let i = 0; i < images.length; i++) {
    executions.push(getSharpMetadataFromS3ImageKey(images[i]));
  }
  /**
   *
   * @type {Metadata[]}
   */
  let metadataResponsesForImages = await Promise.all(executions);

  logger.debug("metadataResponseForImages successful now parsing it to JSON");
  /**
   *
   * @type {JSON}
   */
  let response = JSONUtils.getJSONFromJavascriptObject(metadataResponsesForImages);
  logger.info("metadata result for images in JSON format", response);

  return {
    statusCode: 200,
    job_id: event.job_id,
    body: response,
    analyzer_name: event.input.analyzer_name,
    rules: event.rules
  }
};

/**
 *
 * @param imageKey
 * @returns {Promise<{analyzer_result: {aspect_ratio: number, format: *, width: *, dpi: *, space: *, height: *}, image_key: *}>}
 */
async function getSharpMetadataFromS3ImageKey(imageKey) {
  /**
   *
   * @type {S3Path}
   */
  let s3Path = S3Path.create(QCS3Paths.getBucket(), imageKey);
  /**
   *
   * @type {S3.GetObjectOutput}
   */
  let s3Object = await getObjectFromS3(s3Path);

  /**
   *
   * @type {ImageMetadata}
   */
  let imageMetadata = await sharpUtils.getSharpMetadata(s3Object.Body);
  // Returning a metadata response object for each image (which will be automatically merged with Promise.all)
  return new AnalyzerResultForImage(imageKey, imageMetadata);
}

/**
 *
 * @param {*} event Event object
 * @returns {JSON} metadata analyzer result for images
 */
exports.handler = middy()
  .use(attachJobIdToLogger(logger))
  .use(extractAnalyzerInput())
  .handler(handler);