const {Rules, AnalyzerEntryModel} = require("./rule-utils");

/**
 *
 * @param {Rules} rules
 * @param {string} categoryName
 * @param {ImageType} imageType
 * @returns {Map<string,Rule[]>} Returns the marketplace name to rules array.
 */
function rulesDiscovery(rules, categoryName, imageType) {
  /**
   * *
   * @type {Map<string, Rule[]>} Market place name to rules.
   */
  const marketPlaceNameToRules = new Map();
  let marketPlaceNames = rules.getMarketPlaceNames();
  marketPlaceNames.forEach(currentMarketPlaceName => {
    let marketPlace = rules.getMarketPlace(currentMarketPlaceName);
    /**
     *  @type {Rule[]}
     */
    let finalRules = marketPlace.getRulesForCategoryAndImageType(categoryName, imageType);
    marketPlaceNameToRules.set(currentMarketPlaceName, finalRules);
  });
  return marketPlaceNameToRules;
}


/**
 *
 * @param {Rules} rules
 * @param {RuleApplicability}listingName
 * @returns {Map<string,Rule[]>} Returns the marketplace name to rules array.
 */
function getListingRules(rules, listingName) {
  /**
   * *
   * @type {Map<string, Rule[]>} Market place name to rules.
   */
  const listingRules = new Map();
  let marketPlaceNames = rules.getMarketPlaceNames();
  marketPlaceNames.forEach(currentMarketPlaceName => {
    let marketPlace = rules.getMarketPlace(currentMarketPlaceName);
    /**
     *  @type {Rule[]}
     */
    let finalRules = marketPlace.getListingRule(listingName);
    listingRules.set(currentMarketPlaceName, finalRules);
  });
  return listingRules;
}

const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {});

/**
 * *
 * @param finalRulesJSON
 * @param jobId{string}
 * @return {AnalyzerEntryModel[]}
 */
function analyzersFromRules(finalRulesJSON, jobId) {
  console.log(jobId, " Inside analyzersFromRules() with parameters: finalRulesJSON ", finalRulesJSON);
  let inputJSONString = JSON.stringify(finalRulesJSON);
  let inputJSON = JSON.parse(inputJSONString);
  let analyzers = {};
  /**
   * *
   * @type {AnalyzerEntryModel[]}
   */
  let finalAnalyzers = [];
  inputJSON.forEach(image => {
    let currentGroup = groupBy(image.image_rules, v => v.analyzer);
    let analyzersNames = Object.keys(currentGroup);
    let analyzersInArray=[];
    analyzersNames.forEach(analyzersName =>{
      let ar=[];
        ar=analyzersName.split(",");
      ar.forEach(a => {
        analyzersInArray.push(a);
      } )
    })
    let uniqueAnalyzerName =[];
    analyzersInArray.forEach( name =>{
        if(!uniqueAnalyzerName.includes(name)){
          uniqueAnalyzerName.push(name);
      }
    })
    uniqueAnalyzerName.forEach(analyzersName => {
      if (analyzers[analyzersName] === undefined) {
        analyzers[analyzersName] = [];
      }
      analyzers[analyzersName].push(image.image_key);
    })
  });
  Object.keys(analyzers).forEach(analyzer => {
    finalAnalyzers.push(new AnalyzerEntryModel({analyzer_name: analyzer, image_s3_keys: analyzers[analyzer]}))
  })
  return finalAnalyzers;
}

module.exports = {analyzersFromRules, rulesDiscovery, getListingRules}