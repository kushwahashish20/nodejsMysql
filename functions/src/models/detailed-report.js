const SellerPlatform = require("../util/seller-platform");
const {ImageType} = require("../rule-engine/rule-utils");
const {LookupValueUtil} = require('../util/lookup-value-util');

class Overview {
  /**
   * @type {string}
   */
  report_url;

  /**
   * @type {ReportListingImages}
   */
  images;

  /**
   * @type {string}
   */
  marketplace;

  /**
   * @type {string}
   */
  product_name;

  /**
   * @type {number}
   */
  rating

  /**
   * @type {number}
   */
  reviewer_count

  /**
   * @type {number}
   */
  rating_count

  /**
   * @type {ListingPrice}
   */
  price

  /**
   * @type {string[]}
   */
  listing_category_array

  /**
   *
   * @param rainforestResponse
   * @param images{ImageEntryModel[]}
   * @return {Overview}
   */
  static getOverviewForAmazon(rainforestResponse, images) {
    let overview = new Overview();
    overview.report_url = rainforestResponse.product?.link;
    overview.marketplace = SellerPlatform.AMAZON.getName();
    overview.product_name = rainforestResponse.product?.title;
    overview.rating = rainforestResponse.product?.rating;
    overview.reviewer_count = rainforestResponse.product?.reviewer_total;
    overview.rating_count = rainforestResponse.product?.ratings_total;
    overview.listing_category_array = this.getListingDetails(rainforestResponse.product?.categories)
    if (rainforestResponse.product?.buybox_winner?.price !== undefined) {
      overview.price = new ListingPrice(rainforestResponse.product?.buybox_winner?.price);
    }
    overview.images = ReportListingImages.functionGetReportImageObjectFromImagesArray(images);
    return overview;
  }

  static getListingDetails(categoriesArray) {
    return categoriesArray.map((element) => {
      return element.name;
    });
  }
}

class ListingPrice {
  /**
   * @type {string}
   */
  currency

  /**
   * @type{string}
   */
  symbol

  /**
   * @type {number}
   */
  amount

  /**
   * @type {string}
   */
  raw


  constructor(rainforestPriceObject) {
    this.raw = rainforestPriceObject?.raw;
    this.currency = rainforestPriceObject.currency;
    this.symbol = rainforestPriceObject.symbol;
    this.amount = rainforestPriceObject.value;
  }
}

class ReportListingImages {

  /**
   * @type {string}
   */
  main_id

  /**
   * @type {string[]}
   */
  variant_ids

  /**
   *
   * @param {string} mainId
   * @param {string[]} variantIds
   */
  constructor(mainId, variantIds) {
    this.main_id = mainId;
    this.variant_ids = variantIds;
  }

  /**
   *
   * @param images{ImageEntryModel[]}
   * @returns {ReportListingImages}
   */
  static functionGetReportImageObjectFromImagesArray(images) {
    let mainId;
    let variantIds = [];
    images.forEach(image => {
      if (ImageType.toEnum(image.image_type).equals(ImageType.MAIN)) {
        mainId = image.image_id
      } else if (ImageType.toEnum(image.image_type).equals(ImageType.VARIANT)) {
        variantIds.push(image.image_id)
      }
    })
    /**
     * @type {ReportListingImages}
     */
    return new ReportListingImages(mainId, variantIds);
  }

}

class FrontendReport {
  /**
   * @type {Overview}
   */
  overview

  /**
   * @type {any}
   */
  listing_score

  /**
   * @type {DetailedReport}
   */
  detailed_report

  /**
   * @type {JSON}
   */
  image_id_to_url

  /**
   * @type {ScoreByImage}
   */
  score_by_image

  constructor(overview, listingScore, detailedReport, scoreByImages, imageIdToURL) {
    this.image_id_to_url = imageIdToURL;
    this.overview = overview;
    this.listing_score = listingScore;
    this.detailed_report = detailedReport;
    this.score_by_image = scoreByImages;
  }

  /**
   *
   * @param {Overview}overview
   */
  setOverview(overview) {
    this.overview = overview;
  }

  /**
   *
   * @param {any}listingScore
   */
  setListingScore(listingScore) {
    this.listing_score = listingScore;
  }

  /**
   *
   * @param {DetailedReport}detailedReport
   */
  setDetailedReport(detailedReport) {
    this.detailed_report = detailedReport;
  }

  /**
   *
   * @param {JSON}imageIdToURL
   */
  setImageIdToURL(imageIdToURL) {
    this.image_id_to_url = imageIdToURL;
  }
}

class DetailedReport {

  /**
   * @type{string}
   */
  image_id

  /**
   * @type{number}
   */
  count

  /**
   *@type{CategoryReport[]}
   */
  data

  /**
   *
   * @param {string} imageId
   * @param {number} issuesCount
   * @param {CategoryReport[]} imageExecutionResultsData
   */
  constructor(imageId, issuesCount, imageExecutionResultsData) {
    this.setImageId(imageId);
    this.setCount(issuesCount);
    this.setData(imageExecutionResultsData);
  }

  /**
   *
   * @returns {string}
   */
  getImageId() {
    return this.image_id;
  }

  /**
   *
   * @param {string}id
   */
  setImageId(id) {
    this.image_id = id;
  }

  /**
   *
   * @returns {number}
   */
  getCount() {
    return this.count;
  }

  /**
   *
   * @param {number}count
   */
  setCount(count) {
    this.count = count;
  }

  /**
   *
   * @returns {CategoryReport[]}
   */
  getData() {
    return this.data;
  }

  /**
   *
   * @param {CategoryReport[]} data
   */
  setData(data) {
    this.data = data;
  }


}

class CategoryReport {

  /**
   * @type{string}
   */
  category_id

  /**
   * @type{string}
   */
  category_label

  /**
   * @type{number}
   */
  score_change

  /**
   * @type{number}
   */
  actual_score
  /**
   *
   * @type {TabDetail[]}
   */
  tab_details

  /**
   *
   * @param {string} categoryId
   * @param {TabDetail[]} tabDetails
   */
  constructor(categoryId, tabDetails, actualScore, potentialScore) {
    this.setCategoryId(categoryId);
    this.setCategoryLabel(LookupValueUtil.getCategoryLabel(categoryId));
    this.setTabDetail(tabDetails);
    this.setActualScore(actualScore);
    this.setPotentialScore(potentialScore);
  }

  setActualScore(actualScore) {
    this.actual_score = actualScore
  }

  setPotentialScore(potentialScore) {
    this.score_change = potentialScore
  }

  /**
   *
   * @returns {string}
   */
  getCategoryId() {
    return this.category_id;
  }

  /**
   *
   * @param {string}iD
   */
  setCategoryId(iD) {
    this.category_id = iD
  }

  /**
   *
   * @returns {string}
   */
  getCategoryLabel() {
    return this.category_label;
  }

  /**
   *
   * @param label
   */
  setCategoryLabel(label) {
    this.category_label = label
  }

  /**
   *
   * @returns {TabDetail[]}
   */
  getTabDetail() {
    return this.tab_details;
  }

  /**
   *
   * @param {TabDetail[]} tabDetail
   */
  setTabDetail(tabDetail) {
    this.tab_details = tabDetail;
  }
}

class TabDetail {

  /**
   * @type{number}
   */
  issue_id

  /**
   * @type{string}
   */
  issue_label

  /**
   *
   * @type {Detail[]}
   */
  details

  /**
   *
   * @param {string} issueId
   * @param {Detail[]} details
   */
  constructor(issueId, details) {
    this.setIssueId(issueId);
    this.setIssueLabel(LookupValueUtil.getIssueLabel(issueId));
    this.setDetails(details);
  }

  /**
   *
   * @returns {number}
   */
  getIssueId() {
    return this.issue_id;
  }

  /**
   *
   * @param {number}issueId
   */
  setIssueId(issueId) {
    this.issue_id = issueId;
  }

  /**
   *
   * @returns {string}
   */
  getIssueLabel() {
    return this.issue_label;
  }

  /**
   *
   * @param {string}issueLabel
   */
  setIssueLabel(issueLabel) {
    this.issue_label = issueLabel;
  }

  /**
   *
   * @returns {Detail[]}
   */
  getDetails() {
    return this.details;
  }

  /**
   *
   * @param {Detail[]}details
   */
  setDetails(details) {
    this.details = details;
  }
}

class Detail {

  /**
   * @type{Boolean}
   */
  result

  /**
   * @type{string}
   */
  rule_id

  /**
   * @type{string}
   */
  rule_label

  /**
   * @type{number}
   */
  potential_score

  /**
   * @type{string}
   */
  actual_value

  /**
   * @type{string}
   */
  expected_value

  /**
   * @type{string}
   */
  description

  /**
   * @type{string}
   */
  how_to

  /**
   * @type{string}
   */
  how_to_learn_more

  /**
   *
   * @param {Boolean}ruleResult
   * @param {string}ruleId
   * @param {number}potentialScore
   * @param {number}actualValue
   * @param {number}expectedValue
   * @param {string} executionMessage
   */
  constructor(ruleResult, ruleId, potentialScore, actualValue, expectedValue, executionMessage) {
    this.setResult(ruleResult);
    this.setRuleId(ruleId);
    this.setHowTo(LookupValueUtil.getRuleHowTo(ruleId));
    this.setHowToLearnMore(LookupValueUtil.getRuleHowToLearnMore(ruleId));
    this.setRuleLabel(ruleResult ? LookupValueUtil.getRuleLabelSuccess(ruleId) : LookupValueUtil.getRuleLabel(ruleId));
    this.setPotentialScore(Math.round(potentialScore));
    if (actualValue !== undefined && typeof actualValue === "number") {
      actualValue = Math.round(actualValue * 100) / 100
    }
    if (expectedValue !== undefined && typeof expectedValue === "number") {
      expectedValue = Math.round(expectedValue * 100) / 100
    }
    // If a rule has a custom message then set that, else set the generic message based on actual and expected value
    if (executionMessage !== undefined) {
      this.setDescription(executionMessage);
    } else {
      if (ruleResult === true) {
        this.setDescription(LookupValueUtil.getRuleDescriptionSuccess(ruleId, [actualValue, expectedValue]));
      } else {
        this.setDescription(LookupValueUtil.getRuleDescription(ruleId, [actualValue, expectedValue]));
      }
    }
  }

  setActualValue(actualValue) {
    this.actual_value = actualValue;
  }

  setExpectedValue(expectedValue) {
    this.expected_value = expectedValue;
  }

  /**
   *
   * @returns {Boolean}
   */
  getResult() {
    return this.result
  }

  /**
   *
   * @param {Boolean}result
   */
  setResult(result) {
    this.result = result;
  }

  /**
   *
   * @returns {number}
   */
  getRuleId() {
    return this.rule_id
  }

  /**
   *
   * @param {string} ruleId
   */
  setRuleId(ruleId) {
    this.rule_id = ruleId;
  }

  /**
   *
   * @returns {string}
   */
  getRuleLabel() {
    return this.rule_label
  }

  /**
   *
   * @param {string}ruleLabel
   */
  setRuleLabel(ruleLabel) {
    this.rule_label = ruleLabel;
  }

  /**
   *
   * @returns {number}
   */
  getPotentialScore() {
    return this.potential_score;
  }

  /**
   *
   * @param {number}potentialScore
   */
  setPotentialScore(potentialScore) {
    this.potential_score = potentialScore;
  }

  /**
   *
   * @returns {string}
   */
  getDescription() {
    return this.description;
  }

  /**
   *
   * @param {string}description
   */
  setDescription(description) {
    this.description = description;
  }

  /**
   *
   * @returns {string}
   */
  getHowTo() {
    return this.how_to;
  }

  /**
   *
   * @returns {string}
   */
  getHowToLearnMore() {
    return this.how_to_learn_more;
  }

  /**
   *
   * @param {string}howTo
   */
  setHowTo(howTo) {
    this.how_to = howTo;
  }

  /**
   *
   * @param {string}howTo
   */
  setHowToLearnMore(howToLearnMore) {
    this.how_to_learn_more = howToLearnMore;
  }

}

class ListingScoreCategory {
  /**
   * @type{string}
   */
  category_id

  /**
   * @type{string}
   */
  category_label

  /**
   * @type{number}
   */
  score

  /**
   * @type{number}
   */
  score_change

  /**
   * @type{number}
   */
  sub_label

  /**
   *
   * @param {string} categoryId
   * @param {Map} score
   */
  constructor(categoryId, score) {
    this.setCategory_id(categoryId);
    this.setCategory_label(LookupValueUtil.getCategoryLabel(categoryId));
    this.setScore(100 - score.get(categoryId));
    this.setScore_change(score.get(categoryId));
    this.setSub_level(LookupValueUtil.getSubLabelByKey("score"));
  }

  /**
   *
   * @returns {string}
   */
  getCategory_id() {
    return this.category_id;
  }

  /**
   *
   * @param {string}value
   */
  setCategory_id(value) {
    this.category_id = value;
  }

  /**
   *
   * @param {}value
   */
  setSub_level(value) {
    this.sub_label = value;
  }

  /**
   *
   * @returns {string}
   */
  getCategory_label() {
    return this.category_label;
  }

  /**
   *
   * @param {string}value
   */
  setCategory_label(value) {
    this.category_label = value;
  }

  /**
   *
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   *
   * @param {number}value
   */
  setScore(value) {
    this.score = value;
  }

  /**
   *
   * @returns {number}
   */
  getScore_change() {
    return this.score_change;
  }

  /**
   *
   * @param {number}value
   */
  setScore_change(value) {
    this.score_change = value;
  }
}

class Recommendation {

  /**
   * @type{string}
   */
  category_label

  /**
   * @type{string}
   */
  sub_category_label

  /**
   * @type{ListingExample}
   */
  listing_examples

  constructor(category_label, sub_category_label, images) {
    this.setCategoryLabel(category_label);
    this.setSubCategoryLabel(sub_category_label);
    this.setListingExamples(images)
  }

  /**
   *
   * @returns {string}
   */
  getCategoryLabel() {
    return this.category_label;
  }

  /**
   *
   * @param {string}value
   */
  setCategoryLabel(value) {
    this.category_label = value;
  }

  /**
   *
   * @returns {string}
   */
  getSubCategoryLabel() {
    return this.sub_category_label;
  }

  /**
   *
   * @param {string}value
   */
  setSubCategoryLabel(value) {
    this.sub_category_label = value;
  }

  /**
   *
   * @returns {ListingExample}
   */
  getListingExamples() {
    return this.listing_examples;
  }

  /**
   *
   * @param value
   */
  setListingExamples(value) {
    this.listing_examples = new ListingExample(value);
  }


}

class ListingExample {

  /**
   * @type{number}
   */
  length

  /**
   * @type{string[]}
   */
  images

  constructor(listingExample) {
    this.setLength(listingExample);
    this.setImages(listingExample);
  }

  /**
   *
   * @returns {number}
   */
  getLength() {
    return this.length;
  }

  /**
   *
   * @param {number}value
   */
  setLength(value) {
    this.length = value.length;
  }

  /**
   *
   * @returns {string[]}
   */
  getImages() {
    return this.images;
  }

  /**
   *
   * @param {string[]}value
   */
  setImages(value) {
    this.images = value.map(imageKey => {
      return imageKey.substring(imageKey.lastIndexOf("/") + 1, imageKey.lastIndexOf("."))
    });
  }
}

class ListingScore {

  /**
   * @type{string}
   */
  marketplace

  /**
   * @type{number}
   */
  overall_score

  /**
   * @type{number}
   */
  overall_score_change

  /**
   * @type{ListingScoreCategory[]}
   */
  categories

  /**
   * @type{JSON}
   */
  issues

  /**
   * @type{string}
   */
  sub_label

  /**
   * @type{Recommendation}
   */
  recommendations

  /**
   *
   * @param {ListingScoreCategory[]} listingScoreCategories
   * @param {string} platformName
   * @param {number} overallScore
   * @param {JSON} issues
   */
  constructor(listingScoreCategories, platformName, overallScore, issues) {
    this.setCategories(listingScoreCategories);
    this.setMarketplace(platformName);
    this.setSub_label(LookupValueUtil.getSubLabelByKey("overall_score"))
    this.setOverall_score(100 - overallScore);
    this.setOverall_score_change(overallScore);
    this.setIssues(issues);
  }

  /**
   *
   * @returns {string}
   */
  getMarketplace() {
    return this.marketplace;
  }

  /**
   *
   * @param {string}value
   */
  setSub_label(value) {
    this.sub_label = value;
  }

  /**
   *
   * @param {string}value
   */
  setMarketplace(value) {
    this.marketplace = value;
  }

  /**
   *
   * @returns {number}
   */
  getOverall_score() {
    return this.overall_score;
  }

  /**
   *
   * @param {number}value
   */
  setOverall_score(value) {
    this.overall_score = value;
  }

  /**
   *
   * @returns {number}
   */
  getOverall_score_change() {
    return this.overall_score_change;
  }

  /**
   *
   * @param {number}value
   */
  setOverall_score_change(value) {
    this.overall_score_change = value;
  }

  /**
   *
   * @returns {ListingScoreCategory[]}
   */
  getCategories() {
    return this.categories;
  }

  /**
   *
   * @param {ListingScoreCategory[]}value
   */
  setCategories(value) {
    this.categories = value;
  }

  /**
   *
   * @returns {JSON}
   */
  getIssues() {
    return this.issues;
  }

  /**
   *
   * @param {JSON}value
   */
  setIssues(value) {
    this.issues = value;
  }

  /**
   *
   * @returns {Recommendation}
   */
  getRecommendations() {
    return this.recommendations;
  }

  /**
   *
   * @param {Recommendation} recommendation
   */
  setRecommendations(recommendation) {
    this.recommendations = recommendation;
  }
}

class ListingScoreIssues {
  /**
   * @type{number}
   */
  count

  /**
   * @type{number}
   */
  improving_score

  /**
   *
   * @returns {number}
   */
  getListingCount() {
    return this.count;
  }

  /**
   *
   * @returns {number}
   */
  getImprovingScore() {
    return this.improving_score;
  }

  /**
   *
   * @param {number}value
   */
  setListingCount(value) {
    this.count = value;
  }

  /**
   *
   * @param {number}value
   */
  setImprovingScore(value) {
    this.improving_score = value;
  }
}

class ScoreByImage {

  /**
   * @type{ScoreByImageDetails[]}
   */
  score_by_image = []

  /**
   *
   * @param imageToComplianceLevel
   * @param {Map<string, Score>}imageToImageScoreMao
   */
  constructor(imageToComplianceLevel, imageToImageScoreMao) {
    for (let [imageKey, complianceLevelExecutions] of imageToComplianceLevel) {
      this.score_by_image.push(new ScoreByImageDetails(complianceLevelExecutions, imageKey, imageToImageScoreMao));
    }
  }

  /**
   *
   * @returns {ScoreByImageDetails[]}
   */
  getScoreByImageArray() {
    return this.score_by_image;
  }

}

class ScoreByImageDetails {

  /**
   * @type{string}
   */
  image_id

  /**
   * @type{number}
   */
  total_score

  /**
   * @type{number}
   */
  score_change

  /**
   *
   * @param imageComplianceLevelExecutions
   * @param {string}imageKey
   * @param {Map<string, Score>} imageToImageScoreMap
   */
  constructor(imageComplianceLevelExecutions, imageKey, imageToImageScoreMap) {
    this.image_id = imageKey.substring(imageKey.lastIndexOf("/") + 1, imageKey.lastIndexOf("."));
    if (imageToImageScoreMap.has(this.getImageId())) {
      let scoresOfImage = imageToImageScoreMap.get(this.getImageId())
      this.total_score = scoresOfImage.getActualScore();
      this.score_change = scoresOfImage.getPotentialScore();
    }
    Object.keys(imageComplianceLevelExecutions).forEach((issue, index) => {
      this[issue] = new IssueDetails(imageComplianceLevelExecutions[issue]);
    });
  }

  /**
   *
   * @returns {string}
   */
  getImageId() {
    return this.image_id;
  }

  /**
   *
   * @returns {number}
   */
  getTotalScore() {
    return this.total_score;
  }

  /**
   *
   * @returns {number}
   */
  getScoreChange() {
    return this.score_change;
  }

}

class IssueDetails {

  /**
   * @type{number}
   */
  count

  /**
   * @type{Issue[]}
   */
  details = []

  /**
   *
   * @param {ReportRule[]} complianceLevelResult
   */
  constructor(complianceLevelResult) {
    let filteredResults = complianceLevelResult.filter(function (reportRule) {
      return reportRule.getResult() === false;
    })
    this.count = filteredResults.length;
    for (let detail in filteredResults) {
      this.details.push(new Issue(filteredResults[detail].getRuleId(), LookupValueUtil.getIssueLabel(filteredResults[detail].getRuleId())));
    }
  }

  /**
   *
   * @returns {number}
   */
  getCount() {
    return this.count;
  }

  /**
   *
   * @returns {Issue[]}
   */
  getDetails() {
    return this.details;
  }

}

class Issue {

  /**
   * @type{string}
   */
  id

  /**
   * @type{string}
   */
  label

  constructor(id, label) {
    this.id = id;
    this.label = label;
  }

  /**
   *
   * @returns {string}
   */
  getId() {
    return this.id;
  }

  /**
   *
   * @returns {string}
   */
  getLabel() {
    return this.label;
  }

}

class ListingDetails {

  /**
   * @type {Boolean}
   */
  is_video_available

  /**
   * @type {Boolean}
   */
  is_multipack;
  /**
   * @type {Boolean}
   */
  _is_below_the_knee;
  /**
   * @type {Boolean}
   */
  _is_above_the_knee;
  /**
   * @type {Boolean}
   */
  _is_back_visible;
  /**
   * @type {Boolean}
   */
  _is_accessory_off_model;

  constructor(listingDetails) {
    this.setIsVideoPresent(listingDetails.is_video_available)
    this.is_multipack = listingDetails.is_multipack;
    this._is_below_the_knee = listingDetails._is_below_the_knee;
    this._is_above_the_knee = listingDetails._is_above_the_knee;
    this.is_one_variant_without_model_is_present=listingDetails.is_one_variant_without_model_is_present;
    this._is_back_visible = listingDetails._is_back_visible;
    this._is_accessory_off_model = listingDetails._is_accessories_off_model;
  }

  setIsVideoPresent(value) {
    this.is_video_available = value;
  }

  getIsVideoPresent() {
    return this.is_video_available;
  }
  /**
   *
   * @returns {Boolean}
   */
  getIsMultipack() {
    return this.is_multipack;
  }

  /**
   *
   * @returns {Boolean}
   */
  getIs_below_the_knee() {
    return this._is_below_the_knee;
  }

  /**
   *
   * @param {Boolean}
   */
  setIs_below_the_knee(value) {
    this._is_below_the_knee = value;
  }

  /**
   *
   * @returns {Boolean}
   */
  getIs_above_the_knee() {
    return this._is_above_the_knee;
  }

  /**
   *
   * @param {Boolean}
   */
  setIs_above_the_knee(value) {
    this._is_above_the_knee = value;
  }

  /**
   *
   * @returns {Boolean}
   */
  getIs_back_details_key_selling_featuer() {
    return this._is_back_visible;
  }

  /**
   *
   * @param {Boolean}
   */
  setIs_back_details_key_selling_featuer(value) {
    this._is_back_visible = value;
  }

  /**
   *
   * @returns {Boolean}
   */
  getOneVariantWithoutModelIsPresent(){
    return this.is_one_variant_without_model_is_present
  }

  /**
   *
   * @param {Boolean} value
   */
  setOneVariantWithoutModelIsPresent(value){
    this.is_one_variant_without_model_is_present=value;
  }

  /**
   *
   * @returns {Boolean}
   */
  getIs_accessory_off_model() {
    return this._is_accessory_off_model;
  }

  /**
   *
   * @param {Boolean}
   */
  setIs_accessory_off_model(value) {
    this._is_accessory_off_model = value;
  }

}

module.exports = {
  Overview,
  TabDetail,
  CategoryReport,
  FrontendReport,
  Detail,
  DetailedReport,
  ScoreByImage,
  ListingScore,
  ListingScoreCategory,
  Issue,
  ListingScoreIssues,
  Recommendation,
  ListingDetails
}