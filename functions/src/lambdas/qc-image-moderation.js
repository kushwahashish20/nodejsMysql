const middy = require('@middy/core');
const {Logger} = require('@aws-lambda-powertools/logger');
const {moderatingImage} = require('../analyzers/qc-image-moderation-utils');
const {attachJobIdToLogger} = require("../util/logger-utils");
const {JSONUtils} = require("../util/json-utils");
const logger = new Logger();
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-2'});


/**
 *
 * @param event
 * @returns {Promise<{analyzer_name: string, rules: *, body: ModerationLabels[], statusCode: number}>}
 */
let handler = async (event) => {
  logger.info("Running moderation Detection with incoming event: ", event);

  let executions = [];
  event.input.image_s3_keys.forEach(image_s3_key => {
    executions.push(moderatingImage(image_s3_key));
  });

  let executionResultsForImages = await Promise.all(executions);
  logger.debug("executionResultsForImages successful now parsing it to JSON");

  /**
   *
   * @type {JSON}
   */
  let response = JSONUtils.getJSONFromJavascriptObject(executionResultsForImages);

  logger.info("moderation Detection analyzer result for images in JSON format", response);
  console.log(response)
  return {
    statusCode: 200,
    body: response,
    analyzer_name: "ModerationLabels",
    rules: event.rules
  }
};
/**
 *
 * @param {*} event Event object
 * @returns {JSON} metadata for image
 */
exports.handler = middy()
  .use(attachJobIdToLogger(logger))
  .handler(handler);