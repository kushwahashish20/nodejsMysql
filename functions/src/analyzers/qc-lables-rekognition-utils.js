const {Logger} = require('@aws-lambda-powertools/logger');
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const AnalyzerResultForImage = require("../models/analyzer-result-response");
const {LabelObject} = require("../models/final-image-data");
const {QCS3Paths} = require('../util/s3-utils.js');
const logger = new Logger();

/**
 *
 * @param s3ImageKey
 * @returns {Promise<AnalyzerResultForImage>}
 */
async function detectLabelFromImage(s3ImageKey) {
  logger.debug("Running detectLabelFromImage", s3ImageKey);
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
   * @type {PromiseResult<Rekognition.DetectLabelsResponse, AWSError>}
   */
  let rawRekognitionLabelsResponse = await rekognition.detectLabels(params).promise();
  logger.debug("Label Response: ", rawRekognitionLabelsResponse);

  let labelObject = new LabelObject(rawRekognitionLabelsResponse.Labels);

  return new AnalyzerResultForImage(s3ImageKey, labelObject);
}

module.exports = {detectLabelFromImage};