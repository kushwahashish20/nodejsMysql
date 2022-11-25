const path = require("path");
const {Logger} = require('@aws-lambda-powertools/logger');
const logger = new Logger();

class Rules {
  /**
   * @type{Map<string,Array<string>>}
   */
  #categoryNamesToRuleNames;

  constructor(json) {
    this.json = json;

  }

  /**
   * @returns {Array<string>}
   */
  getMarketPlaceNames() {
    return Object.keys(this.json);
  }

  /**
   *
   * @param marketPlaceName{string} Name of the marketPlace
   * @returns {MarketPlace}MarketPlace - MarketPlace Object
   */
  getMarketPlace(marketPlaceName) {
    return new MarketPlace(this.json[marketPlaceName]);
  }
}

class MarketPlace {
  /**
   * @type {Map<string,Array<string>>}
   */
  #categoryNameToRuleNames;

  /**
   *
   * @type Rule[]
   */
  #rules;

  /**
   * @type {Map<string,Array<string>>}
   */
  #displayReportCategoryToRuleNames;


  /**
   * @type {Map<string, number>}
   */
  #displayReportCategoryToWeightageMapping;

  /**
   * @type {Map<string, number>}
   */
  #displayRuleToWeightageMapping

  constructor(json) {
    this.json = json;


    // Preparing Display Report Category and Rule Weigtage
    let displayReportCategories = this.json["display_report_category_to_rule_mapping"];
    this.#displayReportCategoryToRuleNames = new Map();
    this.#displayRuleToWeightageMapping = new Map();
    Object.keys(displayReportCategories).forEach((displayReportCategoryId) => {
      let currentDisplayCategoryObject = displayReportCategories[displayReportCategoryId];
      let currentDisplayCategoryKeys = Object.keys(currentDisplayCategoryObject);
      let currentDisplayCategoryRuleNames = [];
      currentDisplayCategoryKeys.forEach((ruleId) => {
        currentDisplayCategoryRuleNames.push(ruleId);
        this.#displayRuleToWeightageMapping.set(ruleId, currentDisplayCategoryObject[ruleId].weightage)
      })
      this.#displayReportCategoryToRuleNames.set(displayReportCategoryId, currentDisplayCategoryRuleNames);
    })

    // Preparing Display Report Category and Weightage Mapping
    let displayReportPlatformCategories = this.json["display_report_platform_to_category_mapping"];
    this.#displayReportCategoryToWeightageMapping = new Map();
    Object.keys(displayReportPlatformCategories).forEach((displayCategoryId) => {
      this.#displayReportCategoryToWeightageMapping.set(displayCategoryId, displayReportPlatformCategories[displayCategoryId]);
    });

    // Preparing Product Category and Rule Mapping
    let categoryMappings = this.json["categories_mapping"];
    this.#categoryNameToRuleNames = new Map();
    Object.keys(categoryMappings).forEach((categoryName) => {
      const ruleNames = categoryMappings[categoryName];
      this.#categoryNameToRuleNames.set(categoryName, [...ruleNames]);
    });

    this.#rules = this.#loadRules();
  }

  /**
   *
   * @returns {Map<string, Array<string>>}
   */
  getDisplayReportCategoryToRuleMapping() {
    return this.#displayReportCategoryToRuleNames;
  }

  /**
   *
   * @returns {Map<string, number>}
   */
  getDisplayReportRuleToWeightageMapping() {
    return this.#displayRuleToWeightageMapping
  }

  /**
   *
   * @returns {Map<string, number>}
   */
  getDisplayReportCategoryToWeightageMapping() {
    return this.#displayReportCategoryToWeightageMapping;
  }

  /**
   *
   * @param {string} ruleId
   * @returns {number}
   */
  getPotentialScoreForRuleId(ruleId) {
    if(this.#displayRuleToWeightageMapping.has(ruleId)){
      return this.#displayRuleToWeightageMapping.get(ruleId) * 100;
    }else{
      return 0;
    }
  }

  /**
   *
   * @param {string}categoryId
   * @returns {number}
   */
  getPotentialScoreForCategoryId(categoryId) {
    return this.#displayReportCategoryToWeightageMapping.get(categoryId) * 100;
  }


    /**
   *
   * @return {Rule[]}
   */
  #loadRules() {
    let rulesJson = this.json["rules"];
    const count = rulesJson ? rulesJson.length : 0;
    /**
     * *
     * @type {Rule[]}
     */
    const rules = []
    for (let index = 0; index < count; index++) {
      rules.push(new Rule(rulesJson[index]));
    }
    return rules;
  }

  /**
   *
   * @returns {number}
   */
  getNumberOfRules() {
    return this.#rules.length
  }

  /**
   *
   * @param index{number}
   * @return {Rule}
   */
  #getRuleAtIndex(index) {
    return this.#rules[index];
  }

  /**
   * @param name{string}
   * @return {Rule|null}
   */
  findRuleByName(name) {
    return this.#rules.find(r => r.rule_id === name);
  }

  /**
   * @param ruleApplicability{RuleApplicability}
   * @return {Rule[]|null}
   */
  findRuleByRuleApplicability(ruleApplicability) {
    return this.#rules.filter((rule) => {
      if (rule.getRuleApplicability().name() === ruleApplicability.name()) {
        return rule;
      }
    })
  }

  /**
   *
   * @return {Rule[]}
   */
  getRules() {
    return this.#rules;
  }

  /**
   *
   * @return {Map<string, Array<string>>}
   */
  getCategoryNameToRuleNames() {
    return this.#categoryNameToRuleNames;
  }


  /**
   *
   * @param {string} categoryMappingName
   * @returns {String[]}
   */
  getRuleNamesForCategory(categoryMappingName) {
    let response = [];
    let duplicateDetector = new Set();
    /**
     * @param ruleNames{string[]}
     */
    const collector = (ruleNames) => {
      if (ruleNames) {
        ruleNames.filter(r => !duplicateDetector.has(r)).forEach(r => {
          duplicateDetector.add(r);
          response.push(r);
        });
      }
    };
    if (categoryMappingName) {
      categoryMappingName = categoryMappingName.toLowerCase();
      collector(this.#categoryNameToRuleNames.get(categoryMappingName));
      //All rules applied to all the images;
      collector(this.#categoryNameToRuleNames.get("all"));
      collector(this.#categoryNameToRuleNames.get("listing"));
    }

    return response;
  }

  /**
   *
   * @param {string} categoryName
   * @param {ImageType} imageType
   * @return {Rule[]} Rule names  under this category and for given image type.
   *
   */
  getRulesForCategoryAndImageType(categoryName, imageType) {
    /**
     *
     * @type {Rule[]}
     */
    let finalRules = [];
    logger.debug(`Looking for rules against category name: ${categoryName} and imageType: ${imageType.name()}`);
    let categoryRuleNames = this.getRuleNamesForCategory(categoryName);
    //noinspection JSCheckFunctionSignatures
    logger.debug(`Found category rule names. count: ${categoryRuleNames.length}`);
    finalRules = categoryRuleNames
      .map((ruleName) => this.findRuleByName(ruleName))
      .filter(rule => rule.getImageType().matches(imageType));

    //noinspection JSCheckFunctionSignatures
    logger.debug(`Matched rules for given category name: ${categoryName} and imageType: ${imageType.name()}`, {
      count: finalRules.length
    });
    return finalRules;
  }

  /**
   *
   * @param {RuleApplicability} listingType
   * @return {Rule[]} Rule names  under this category and for given image type.
   *
   */
  getListingRule(listingType) {
    /**
     *
     * @type {Rule[]}
     */
    let finalRules = this.findRuleByRuleApplicability(listingType);
    logger.debug(`Matched rules for given Listing name: ${listingType}`)
    return finalRules;
  }
}

class Rule {
  /**
   * @type{any}
   */
  #raw;

  constructor(ruleJson) {
    this.#raw = ruleJson;
    this.image_type = ruleJson["image_type"];
    this.rule_id = ruleJson["rule_id"];
    this.analyzer = ruleJson["analyzer"];
    this.definitions = ruleJson["definitions"];
    this.confidence_level = ruleJson["confidence_level"];
    this.compliance_level = ruleJson["compliance_level"];
    this.rule_applicability = ruleJson["rule_applicability"];
  }

  getRaw() {
    return this.#raw;
  }

  /**
   *
   * @returns {Definition[]}
   */
  getDefinitions() {
    const count = this.definitions ? this.definitions.length : 0;
    /**
     * *
     * @type {Definition[]}
     */
    const definitions = []
    for (let index = 0; index < count; index++) {
      definitions.push(new Definition(this.definitions[index]));
    }
    return definitions;
  }

  getImageType() {
    return new ImageType(this.image_type);
  }

  getRuleApplicability() {
    return new RuleApplicability(this.rule_applicability);
  }

  getAnalyzer() {
    return this.analyzer;
  }

  getConfidenceLevel() {
    return this.confidence_level;
  }

  getId() {
    return this.rule_id;
  }

}

class Definition {

  constructor(json) {
    this.json = json;
  }

  /**
   *
   * @returns {String[]}
   */
  getOperationArray() {
    return Object.keys(this.json);
  }

  getValue() {
    return this.json;
  }

};

/**
 * This enum corresponds to the various Rule Applicability.
 */
class RuleApplicability {
  /**
   * @type{string}
   */
  v;

  constructor(v) {
    /**
     * @type {string}
     */
    this.v = v;
  }

  name() {
    return this.v;
  }

  /**
   * *
   * @param ruleApplicability{RuleApplicability}
   */
  equals(ruleApplicability) {
    return this.v === ruleApplicability?.v
  }

  /**
   * Matches the given rule to this rule.
   * If this rule is ALL, if matches all rules.
   * @param {RuleApplicability} ruleApplicability
   * @return {Boolean}
   */
  matches(ruleApplicability) {
    return this.equals(ruleApplicability);
  }

  /**
   * Try to detect the ImageType based on the given file name.
   * Assumption is that, file name must start with the one of the enum values.
   * For example, file name: main.jpg will match the enum MAIN.
   * Another example: file name: variant-1.jpeg will match to the enum VARIANT.
   * @param fileName
   * @return {RuleApplicability}
   */
  static fileNameToEnum(fileName) {
    fileName = path.basename(fileName).toLowerCase();
    return this.VALUES.find(function (enumOption) {
      return fileName.startsWith(enumOption.v);
    });
  }

  /**
   * *
   * @param v{string}
   * @return {RuleApplicability|null}
   */
  static toEnum(v) {
    if (v) {
      v = v.toLowerCase();
      return this.VALUES.find(function (enumOption) {
        return enumOption.v === v;
      });
    }
    return null;
  }

  static IMAGE = new RuleApplicability("image");
  static LISTING = new RuleApplicability("listing");
  static VALUES = [RuleApplicability.IMAGE, RuleApplicability.LISTING];
}

/**
 * This enum corresponds to the various image types a seller has.
 */
class ImageType {
  /**
   * @type{string}
   */
  #v;

  constructor(v) {
    /**
     * @type {string}
     */
    this.#v = v;
  }

  /**
   * @returns {Boolean}
   */
  isAll() {
    return this.equals(ImageType.ALL);
  }

  /**
   * Matches the given rule to this rule.
   * If this rule is ALL, if matches all rules.
   * @param {ImageType} imageType
   * @return {Boolean}
   */
  matches(imageType) {
    return this.equals(imageType) || this.isAll() || imageType?.isAll();
  }


  name() {
    return this.#v;

  }

  /**
   * *
   * @param imageType{ImageType}
   */
  equals(imageType) {
    return this.#v === imageType?.#v
  }

  /**
   * Try to detect the ImageType based on the given file name.
   * Assumption is that, file name must start with the one of the enum values.
   * For example, file name: main.jpg will match the enum MAIN.
   * Another example: file name: variant-1.jpeg will match to the enum VARIANT.
   * @param fileName
   * @return {ImageType|null}
   */
  static fileNameToEnum(fileName) {
    fileName = path.basename(fileName).toLowerCase();
    return this.#VALUES.find(function (enumOption) {
      return fileName.startsWith(enumOption.#v);
    });
  }

  /**
   * *
   * @param v{string}
   * @return {ImageType|null}
   */
  static toEnum(v) {
    if (v) {
      v = v.toLowerCase();
      return this.#VALUES.find(function (enumOption) {
        return enumOption.#v === v;
      });
    }
    return null;
  }

  static MAIN = new ImageType("main");
  static VARIANT = new ImageType("variant");
  static ALL = new ImageType("all");
  static #VALUES = [ImageType.MAIN, ImageType.VARIANT, ImageType.ALL];
}

/**
 * This class represents the JSON object of images which we pass from one stage to another.
 */
class ImageEntryModel {
  /**
   * @param s3_key{string}
   * @param image_type{string}
   * @param image_id{string}
   */
  constructor({s3_key, image_type, image_id}) {
    this.s3_key = s3_key;
    this.image_type = image_type;
    this.image_id = image_id;
  }

  /**
   * @type{string}
   */
  s3_key;

  /**
   * @type{string}
   */
  image_type;

  /**
   * @type{string}
   */
  image_id;

  /**
   * @type{string}
   */
  getS3Key() {
    return this.s3_key;
  }

  /**
   *
    * @returns {string}
   */
  getImageType(){
    return this.image_type;
  }
}

/**
 * This class represents the JSON object of images which we pass from one stage to another.
 */
class AnalyzerEntryModel {
  /**
   * @type{string}
   */
  analyzer_name;
  /**
   * @type{string[]}
   */
  image_s3_keys;


  constructor({analyzer_name, image_s3_keys}) {
    this.analyzer_name = analyzer_name;
    this.image_s3_keys = image_s3_keys;
  }
}

class ImageRules {
  /**
   * @type {Rule[]}
   */
  rules;

  /**
   *
   * @return {Rule[]}
   */
  static loadRules(rulesJson) {
    const count = rulesJson ? rulesJson.length : 0;
    /**
     * *
     * @type {Rule[]}
     */
    const rules = []
    for (let index = 0; index < count; index++) {
      rules.push(new Rule(rulesJson[index]));
    }
    return rules;
  }
}

// fetchRules(categoryName);
module.exports = {
  Rule,
  Definition,
  MarketPlace,
  ImageType,
  Rules,
  ImageEntryModel,
  AnalyzerEntryModel,
  ImageRules,
  RuleApplicability
};