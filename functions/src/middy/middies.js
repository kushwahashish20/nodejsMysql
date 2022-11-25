const {ImageEntryModel, Rules, AnalyzerEntryModel} = require("../rule-engine/rule-utils");
const {QCS3Paths, S3Util} = require("../util/s3-utils");
const {Logger} = require("@aws-lambda-powertools/logger");
const logger = new Logger();

/**
 *
 * @return {{before: ((function({event: *, context: *}): Promise<void>)|*)}}
 */
function extractImagesMiddy() {
  return {
    /**
     * @param handler{{event:any, context:any}}
     * @return {Promise<void>}
     */
    before: async function (handler) {
      /**
       * @type {Array<ImageEntryModel>}
       */
      let imageEntryModels = [];
      /**
       * @type{Array<*>}
       */
      const images = handler.event.images
      if (images) {
        imageEntryModels = images.map(item => new ImageEntryModel(item))
      }

      handler.context.images = imageEntryModels;
    }
  }
}

function fetchRulesMiddy() {
  return {
    /**
     * @param handler{{event:any, context:any}}
     * @return {Promise<void>}
     */
    before: async function (handler) {
      let rulesFilePath = QCS3Paths.getRulesFilePath();
      logger.debug("Downloading rules.json file from: " + rulesFilePath.toString())
      let rulesJson = await S3Util.getObjectAsJson(rulesFilePath);
      logger.debug("Downloaded rules.json file.")
      handler.context.rules = new Rules(rulesJson);
    }
  }
}

function fetchCategoryMiddy() {
  return {
    /**
     * @param handler{{event:any, context:any}}
     * @return {Promise<void>}
     */
    before: async function (handler) {
      let catagoriesPath = QCS3Paths.getCatagories();
      logger.debug("Downloading catagories.json file from: " + catagoriesPath.toString())
      let catagoriesJson = await S3Util.getObjectAsJson(catagoriesPath);
      logger.debug("Downloaded catagory.json file.")
      handler.context.categories = catagoriesJson;
    }
  }
}

function fetchFilterListKeywordsMiddy() {
  return {
    /**
     * @param handler{{event:any, context:any}}
     * @return {Promise<void>}
     */
    before: async function (handler) {
      let filterListKeywordsPath = QCS3Paths.getFilterListKeywordsPath();
      logger.debug("Downloading keywords.json file from: " + filterListKeywordsPath.toString())
      let keywordsJson = await S3Util.getObjectAsJson(filterListKeywordsPath);
      logger.debug("Downloaded keywords.json file.")
      handler.context.keywords = keywordsJson;
    }
  }
}

/**
 * *
 * @return {{before: ((function({event: *, context: *}): Promise<void>)|*)}}
 */
function extractAnalyzerInput() {
  return {
    /**
     * @param handler{{event:any, context:any}}
     * @return {Promise<void>}
     */
    before: async function (handler) {
      /**
       * @type {Array<AnalyzerEntryModel>}
       */
      let analyzerEntryModels = [];
      /**
       * @type{Array<*>}
       */
      const images = handler.event.input
      if (images) {
        analyzerEntryModels = new AnalyzerEntryModel(images);
      }
      handler.context.analyzerEntryModel = analyzerEntryModels;
    }
  }

}

module.exports = {extractImagesMiddy, fetchRulesMiddy, fetchFilterListKeywordsMiddy, fetchCategoryMiddy, extractAnalyzerInput};