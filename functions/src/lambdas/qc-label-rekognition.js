const middy = require('@middy/core');
const {Logger} = require('@aws-lambda-powertools/logger');
const {detectLabelFromImage} = require('../analyzers/qc-lables-rekognition-utils');
const {attachJobIdToLogger} = require("../util/logger-utils");
const {JSONUtils} = require("../util/json-utils");

const logger = new Logger();

/**
 *
 * @param event
 * @returns {Promise<{analyzer_name: string, rules: *, body: DetectedLables[], statusCode: number}>}
 */
let handler = async (event) => {
  logger.info("Running Label Detection with incoming event: ", event);

  let executions = [];
  event.input.image_s3_keys.forEach(image_s3_key => {
    executions.push(detectLabelFromImage(image_s3_key));
  })

  let executionResultsForImages = await Promise.all(executions);
  logger.debug("executionResultsForImages successful now parsing it to JSON");


  /**
   *
   * @type {JSON}
   */
  let response = JSONUtils.getJSONFromJavascriptObject(executionResultsForImages);

  logger.info("object analyzer result for images in JSON format", response);

  return {
    statusCode: 200,
    body: response,
    analyzer_name: "object",
    rules: event.rules
  }
};

/**
 *
 * @param {*} event Event object
 * @returns {Promise<{analyzer_name: string, rules: *, body: DetectedLables[], statusCode: number}>}
 */
exports.handler = middy()
  .use(attachJobIdToLogger(logger))
  .handler(handler);