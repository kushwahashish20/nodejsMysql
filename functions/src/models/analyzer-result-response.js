const {LabelObject} = require("../models/final-image-data");

class AnalyzerResultForImage {
  /**
   * @type {string}
   */
  image_key;
  /**
   * @type{LabelObject}
   */
  analyzer_result;

  constructor(imageKey, analyzerResult) {
    this.analyzer_result = analyzerResult;
    this.image_key = imageKey;
  }
}

module.exports = AnalyzerResultForImage;