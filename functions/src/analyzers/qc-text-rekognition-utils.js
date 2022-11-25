const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const {Logger} = require('@aws-lambda-powertools/logger');
const logger = new Logger();
const AnalyzerResultForImage = require("../models/analyzer-result-response");
const {Text} = require("../models/final-image-data");
const {QCS3Paths} = require('../util/s3-utils.js');

/**
 *
 * @param s3ImageKey
 * @returns {Promise<{analyzer_result: Rekognition.TextDetectionList, image_key: string}>}
 */
async function detectTextFromImage(s3ImageKey) {
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
   * @type {PromiseResult<Rekognition.DetectTextResponse, AWSError>}
   */
  let rawRekognitionTextResponse = await rekognition.detectText(params).promise();
  logger.debug("Text Response: ", rawRekognitionTextResponse);

  let textdetection = new Text(rawRekognitionTextResponse.TextDetections);

  return new AnalyzerResultForImage(s3ImageKey, textdetection);

}

module.exports = {detectTextFromImage};