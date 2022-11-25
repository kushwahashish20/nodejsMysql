const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const rekognition = new AWS.Rekognition();
const {Logger} = require('@aws-lambda-powertools/logger');
const logger = new Logger();
const AnalyzerResultForImage = require("../models/analyzer-result-response");
const {QCS3Paths} = require('../util/s3-utils.js');

/**
 *
 * @param s3ImageKey
 * @returns {Promise<{analyzer_result: Rekognition.ModerationLabels, image_key: string}>}
 */
async function moderatingImage(s3ImageKey) {
  logger.debug("Running detectTextFromImage method with image: ", s3ImageKey);
  let params = {
    Image: {
      S3Object: {
        Bucket: QCS3Paths.getBucket(),
        Name: s3ImageKey
      }
    }
  };

  /**
   *
   * @type {PromiseResult<Rekognition.DetectModerationLabelsResponse, AWSError>}
   */
  let rawRekognitionModerationResponse = await rekognition.detectModerationLabels(params).promise();
  logger.debug("Text Response: ", rawRekognitionModerationResponse);

  return new AnalyzerResultForImage(s3ImageKey, rawRekognitionModerationResponse.ModerationLabels);

}

module.exports = {moderatingImage};