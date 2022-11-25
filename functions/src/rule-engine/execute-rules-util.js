let jp = require("jsonpath");
const {ImageRules, Definition, MarketPlace} = require('../rule-engine/rule-utils');
const {JSONUtils} = require("../util/json-utils");
const {FinalImageData, LabelObject, Label, Instances, Bounding, BodyDetection} = require("../models/final-image-data");
const finalImageData = require("../models/final-image-data");
const {ListingScore, ListingScoreCategory, Issue, ListingScoreIssues, Recommendation, ListingDetails} = require('../models/detailed-report');
const {LookupValueUtil} = require('../util/lookup-value-util');
const {ScoreByImage} = require("../models/detailed-report");
const {getJsonObjectFromS3, S3Path, QCS3Paths, S3Util} = require('../util/s3-utils.js');


/**
 *
 * @param event
 * @returns {Promise<[]>}
 */
async function groupByImages(event) {
  let finalImageData = [];
  // Outer Loop
  event.forEach((input) => {
    if (input.analyzer_name !== undefined && input.body !== undefined) {

      // Inner Loop
      for (let bodyIndex in input.body) {
        let imageFound = false;
        if (finalImageData.length != 0) {

          for (let finalImageDataIndex in finalImageData) {
            //Check if image is present or not
            if (finalImageData[finalImageDataIndex]['image_key'] === input.body[bodyIndex].image_key) {
              finalImageData[finalImageDataIndex][input.analyzer_name] = input.body[bodyIndex].analyzer_result
              imageFound = true;
              break;
            }

          }
          //if image is not present
          if (!imageFound) {
            finalImageData.push({
              image_key: input.body[bodyIndex].image_key,
              [input.analyzer_name]: input.body[bodyIndex].analyzer_result
            });
          }
        }

        //if the finalImageData is empty
        if (finalImageData.length == 0) {
          finalImageData.push({
            image_key: input.body[bodyIndex].image_key,
            [input.analyzer_name]: input.body[bodyIndex].analyzer_result
          });
        }

      }
      // Outer loop for adding rules in the final merged image JSON
      if (finalImageData.length > 0 && input.rules != undefined) {
        let rules = input.rules;
        rules.forEach(rule => {
          finalImageData.forEach(finalImage => {
            if (rule.image_key === finalImage.image_key) {
              finalImage["image_rules"] = rule.image_rules;
            }
          })
        })
      }
    }
  });
  return await getBodyDetectionData(finalImageData)
  // return finalImageData;
}

async function getBodyDetectionData(finalImageData) {
  let count = 0;
  const executions = [];
  for (let i = 0; i < finalImageData.length; i++) {

    executions.push(getBodyDetectionDataForImage(finalImageData[i].image_key + ".json"));
  }
  let metadataResponsesForImages = await Promise.all(executions);
  finalImageData.forEach(() => {
    finalImageData[count]["body_detection"] = metadataResponsesForImages[count];
    count++;
  })
  return finalImageData;
}

/**
 *
 * @param imageKey
 * @returns {Promise<BodyDetection>}
 */
async function getBodyDetectionDataForImage(imageKey) {
  /**
   *
   * @type {S3Path}
   */
  let s3Path = S3Path.create(QCS3Paths.getBucket(), imageKey);
  try {
    /**
     *
     * @type {S3.GetObjectOutput}
     */
    let s3Object = await S3Util.getObjectAsJson(s3Path);
    return new BodyDetection(s3Object);
  } catch (error) {
    return null;
  }
}

/**
 *
 * @param {FinalImageData}imageData
 * @param {ListingDetails} listingDetails
 * @returns {Map<String, Map<String, ReportRule>>}
 */
function executeRules(imageData, listingDetails) {
  /**
   *
   * @type {Rule[]}
   */
  const rules = ImageRules.loadRules(imageData.getImageRules());
  let currentRuleResult;

  /**
   *
   * @type {ReportRule[]}
   */
  const imageRuleExecutionResults = [];

  let label = imageData.getLabel();

  /**
   *
   * @type {Metadata}
   */
  let metadata = imageData.getMetadata();
  let textDetection = imageData.getText();

  let bodyDetection = imageData.getBodyDetection();

  /**
   *
   * @type {Map<String, ReportRule>}
   */
  const ruleIdToRuleExecutionResult = new Map();
  rules.forEach((rule) => {
    switch (rule.getId()) {
      case "single_model_in_main_image": {
        currentRuleResult = isSingleModelImage(label.getLabelObject(), rule.getConfidenceLevel(), listingDetails);
        break;
      }

      case "product_fill": {
        currentRuleResult = isModelFillingMajorityImageArea(label.getLabelObject(), rule.getConfidenceLevel(), rule.getDefinitions());
        break;
      }

      case "no_promo_text": {
        currentRuleResult = containsNoPromoText(textDetection);
        break;
      }

      case "image_crop_nose_down": {
        currentRuleResult = isModelPresentWithNoseCrop(bodyDetection, rule.getDefinitions(), rule.getConfidenceLevel());
        break;
      }
      case "image-waist-down": {
        currentRuleResult = isWaistDown(bodyDetection, rule.getConfidenceLevel());
        break;
      }
      case "image_crop_nose_down_variant": {
        currentRuleResult = isModelPresentWithNoseCrop(bodyDetection, rule.getDefinitions(), rule.getConfidenceLevel());
        break;
      }

      case "image-full-length": {
        currentRuleResult = isFullLength(bodyDetection, rule.getConfidenceLevel(), listingDetails);
        break;
      }

      case "image-top-body": {
        currentRuleResult = isImageAboveKnee(bodyDetection, rule.getConfidenceLevel(), listingDetails);
        break;
      }

      case "image-back-details": {
        currentRuleResult = isBackDetailKeySellingFeatuer(bodyDetection, rule.getConfidenceLevel(), listingDetails);
        break;
      }

      case "square-aspect-ratio": {
        currentRuleResult = isSquareAspectRatio(imageData, rule);
        break;
      }

      case "image-size": {
        currentRuleResult = isImageSizeCorrect(metadata, rule);
        break;
      }

      case "multipack-off-model": {
        currentRuleResult = isMultipackOffModel(label.getLabelObject(), rule.getConfidenceLevel(), listingDetails);
        break;
      }

      case "accessories-off-model": {
        currentRuleResult = isAccessoriesModleExist(label.getLabelObject(), rule.getConfidenceLevel(), listingDetails);
        break;
      }

      default: {
        /**
         *
         * @type {Definition[]}
         */
        let definitions = rule.getDefinitions();
        if (definitions.length != 0) {
          currentRuleResult = executeGenericRule(definitions, imageData, null);
        }
      }
    }
    if (currentRuleResult !== undefined && currentRuleResult !== null) {
      let currentReportRule = new ReportRule(rule, currentRuleResult);
      ruleIdToRuleExecutionResult.set(rule.getId(), currentReportRule);
    }
  });

  /**
   *
   * @type {Map<String, Map<String, ReportRule>>}
   */
  let imageToImageResults = new Map();
  imageToImageResults.set(imageData.getImageKey(), ruleIdToRuleExecutionResult);
  return imageToImageResults;
}

/**
 *
 * @param {Definition[]} definitions
 * @param {FinalImageData}imageData
 * @param inputActualValue
 * @returns {ExecutionResult}
 */
function executeGenericRule(definitions, imageData, inputActualValue) {
  /**
   *
   * @type {ExecutionResult}
   */
  let currentRuleResult;
  switch (definitions[0].getValue()) {
    case 'OR': {
      currentRuleResult = executeOrFunction(definitions.splice(1), imageData, inputActualValue);
      break;
    }
    case 'AND': {
      currentRuleResult = executeAndFunction(definitions.splice(1), imageData, inputActualValue);
      break;
    }
    default: {
      currentRuleResult = executeASingleDefinition(definitions[0].getValue(), imageData, inputActualValue);
    }
  }
  return currentRuleResult;
}

class labels {
  /**
   * @type{string}
   */
  Name
  /**
   * @type{Instances}
   */
  Instance


  getName() {
    return this.Name;
  }

  setName(value) {
    this.Name = value;
  }

  getInstance() {
    return this.Instance;
  }

  setInstance(value) {
    this.Instance = value;
  }
}

/**
 *
 * @param imageObjectData
 * @param metadata
 * @returns {labels}
 */
function getLargestBoundingBox(imageObjectData, metadata) {
  let height;
  let width;
  let label = new labels();
  let area = 0;
  imageObjectData.forEach((objectData) => {
    if (objectData.getInstance().length !== 0) {
      let instances = objectData.getInstance();
      instances.forEach((instance) => {
        height = instance.BoundingBox.getHeight() * metadata.height;
        width = instance.BoundingBox.getWidth() * metadata.width;
        if (area < height * width) {
          area = height * width;
          label.setName(objectData.Name)
          label.setInstance(instance)
        }
      })
    }
  })
  return label;
}

/**
 *
 * @param imageObjectData
 * @param metadata
 * @returns {boolean}
 */
function isModelCentred(imageObjectData, metadata) {
  let coveredPercent = false;
  let value = getLargestBoundingBox(imageObjectData, metadata);
  let totalWidth = metadata.width;
  let totalHeight = metadata.height;
  let objectWidthStartPoint = metadata.width * value.getInstance().getBounding().getLeft();
  let totalWidthOfObject = (metadata.width * value.getInstance().getBounding().getWidth()) / 2;
  let objectHeightStartPoint = metadata.height * value.getInstance().getBounding().getTop();
  let totalHeightOfObject = (metadata.height * value.getInstance().getBounding().getHeight()) / 2;

  let centreWidthPoint = objectWidthStartPoint + totalWidthOfObject;
  let staringWidthRange = (40 * totalWidth) / 100;
  let endWidthRange = (60 * totalWidth) / 100;
  let centreHeightPoint = objectHeightStartPoint + totalHeightOfObject;
  let staringHeightRange = (40 * totalHeight) / 100;
  let endHeightRange = (60 * totalHeight) / 100;
  if ((centreWidthPoint <= endWidthRange && centreWidthPoint >= staringWidthRange) && (centreHeightPoint <= endHeightRange && centreHeightPoint >= staringHeightRange)) {
    coveredPercent = true;
  }
  return coveredPercent
}

/**
 *
 * @param expectedValue
 * @param incomingValue
 * @returns {boolean}
 */
function greaterThanEqual(expectedValue, incomingValue) {
  return incomingValue >= expectedValue;
}

/**
 *
 * @param expectedValue
 * @param incomingValue
 * @returns {boolean}
 */
function lessThanEqual(expectedValue, incomingValue) {
  return incomingValue <= expectedValue;
}

/**
 *
 * @param expectedValue
 * @param incomingValue
 * @returns {boolean}
 */
function equals(expectedValue, incomingValue) {
  return expectedValue === incomingValue;
}

/**
 *
 * @param arrayToCheck
 * @param incomingValue
 * @returns {*}
 */
function contains(arrayToCheck, incomingValue) {
  return arrayToCheck.includes(incomingValue);
}

/**
 *
 * @param definition
 * @param {FinalImageData} imagedata,
 * @param {any} inputActualValue
 * @returns {string|ExecutionResult|*}
 */
function executeASingleDefinition(definition, imagedata, inputActualValue) {
  /**
   *
   * @type {string[]}
   */
  let operationArray = Object.keys(definition);

  /**
   *
   * @type {string}
   */
  let operationToExecute = operationArray[0];

  let operationObject = definition[operationToExecute];

  /**
   *
   * @type {string[]}
   */
  let jsonPathKeys = Object.keys(operationObject)
  /**
   *
   * @type {string}
   */
  let jsonPath = jsonPathKeys[0];
  let expectedValue = operationObject[jsonPath];

  let actualValue;

  // Checking if the JSON path starts with $, that means the actual value will be coming from the input JSON
  // Else, the actual value must be passed in the function itself
  if (jsonPath.startsWith("$.") && (inputActualValue === undefined || inputActualValue === null)) {
    let imageDataJSON = JSONUtils.getJSONFromJavascriptObject(imagedata, inputActualValue);
    actualValue = jp.value(imageDataJSON, jsonPath);
  } else {
    actualValue = inputActualValue;
  }


  switch (operationToExecute) {
    case "less_than_equal": {
      return new ExecutionResult(actualValue, expectedValue, (lessThanEqual(expectedValue, actualValue)));
    }
    case "greater_than_equal": {
      return new ExecutionResult(actualValue, expectedValue, (greaterThanEqual(expectedValue, actualValue)));
    }
    case "equals": {
      return new ExecutionResult(actualValue, expectedValue, equals(expectedValue, actualValue));
    }
    case "contains": {
      return new ExecutionResult(actualValue, expectedValue, contains(expectedValue, actualValue));
    }
    default:
      return ("no match found");
  }

}

/**
 *
 * @param definitions {Definition[]}
 * @param imagedata
 * @param {any} inputActualValue
 * @returns {ExecutionResult|string}
 */
function executeOrFunction(definitions, imagedata, inputActualValue) {
  let currentState;
  for (let i = 1; i < definitions.length; i++) {
    // Initial condition, where no execution is done
    if (currentState === undefined) {
      currentState = executeASingleDefinition(definitions[i - 1].getValue(), imagedata, inputActualValue) || executeASingleDefinition(definitions[i].getValue(), imagedata), inputActualValue;
    } else {
      currentState = currentState || executeASingleDefinition(definitions[i].getValue(), imagedata, inputActualValue);
    }
  }
  return currentState;
}


/**
 *
 * @param definitions {Definition[]}
 * @param imagedata
 * @param {any} inputActualValue
 * @returns {ExecutionResult}
 */
function executeAndFunction(definitions, imagedata, inputActualValue) {
  let currentState;
  for (let i = 1; i < definitions.length; i++) {
    // Initial condition, where no execution is done
    if (currentState === undefined) {
      currentState = executeASingleDefinition(definitions[i - 1].getValue(), imagedata, inputActualValue) && executeASingleDefinition(definitions[i].getValue(), imagedata, inputActualValue);
    } else {
      currentState = currentState && executeASingleDefinition(definitions[i].getValue(), imagedata, inputActualValue);
    }
  }
  return currentState;
}

/**
 *
 * @param {Text}imageObjectData
 * @returns {boolean}
 */
function containsNoPromoText(imageObjectData) {

  // Have a blacklist set of words, check if the image contains any such word
  // If the word is present in the image, fail

  const promoText = new Set(["free", "sale", "amazon", "alexa"]);
  let containsNoPromoText = true;
  let textAnalyzerResults = imageObjectData.getTextDetection();
  textAnalyzerResults.forEach((objectData) => {
    if ((objectData.getType() === "WORD" && promoText.has(objectData.getDetectedText().toLowerCase()))) {
      containsNoPromoText = false;
      return containsNoPromoText;
    }
  });
  return containsNoPromoText;
}

/**
 *
 * @param  {FinalImageData} imageData
 * @param {Rule} rule
 * @returns {ExecutionResult}
 */
function isSquareAspectRatio(imageData, rule) {

  /**
   *
   * @type {ExecutionResult}
   */
  let currentRuleResult = executeGenericRule(rule.getDefinitions(), imageData, null);

  /**
   *
   * @type {Metadata}
   */
  let metadata = imageData.getMetadata();
  let width = metadata.getWidth();
  let height = metadata.getHeight();
  let actualValue = calculateAspectRatioByHeightAndWidth(width, height);
  let expectedValue = "1:1";
  let customRuleDescription;
  if (currentRuleResult.getExecutionResults() == true) {
    customRuleDescription = LookupValueUtil.getRuleDescriptionSuccess(rule.getId(), [actualValue, expectedValue]);
  } else {
    customRuleDescription = LookupValueUtil.getRuleDescription(rule.getId(), [actualValue, expectedValue]);
  }
  currentRuleResult.setExecutionMessage(customRuleDescription);
  return currentRuleResult;

}

/**
 *
 * @param  {Metadata} metadata
 * @param {Rule} rule
 * @returns {ExecutionResult}
 */
function isImageSizeCorrect(metadata, rule) {
  let result = false;

  let width = metadata.getWidth();
  let height = metadata.getHeight();
  let customRuleDescription;
  let currentRuleResult;

  //Sub Rule 1: min-size >= 500px
  if (width >= 1000 || height >= 1000) {
    result = true;
  } else {
    result = false;
    customRuleDescription = LookupValueUtil.getRuleDescription(rule.getId() + "_recommended", [width, height]);
    currentRuleResult = new ExecutionResult(undefined, undefined, result, customRuleDescription);
    return currentRuleResult;
  }

  //Sub Rule 2: recommended-size >= 1000px
  if (width <= 10000 || height <= 10000) {
    result = true;
  } else {
    result = false;
    customRuleDescription = LookupValueUtil.getRuleDescription(rule.getId() + "_max", [width, height]);
    currentRuleResult = new ExecutionResult(undefined, undefined, result, customRuleDescription);
    return currentRuleResult;
  }

  customRuleDescription = LookupValueUtil.getRuleDescriptionSuccess(rule.getId(), [width, height]);

  currentRuleResult = new ExecutionResult(undefined, undefined, result, customRuleDescription);
  return currentRuleResult;
}

/**
 *
 * @param {number} width
 * @param {number} height
 */
function calculateAspectRatioByHeightAndWidth(width, height) {
  let gcd = greatestCommonDivisor(width, height);
  let ratio = width / gcd + ":" + height / gcd;
  return ratio;
}

/**
 *
 * @param {number} a
 * @param {number} b
 */
function greatestCommonDivisor(a, b) {
  return (b == 0) ? a : greatestCommonDivisor(b, a % b);
}

/**
 * @param {FinalImageData} imageData
 * @param {JSON[]} inputListingRules
 * @param platformName
 * @param images
 * @param listingDetails
 */
function executeListingRules(imageData, inputListingRules, platformName, images, listingDetails) {
  /**
   *
   * @type {Rule[]}
   */
  let listingRules = ImageRules.loadRules(inputListingRules[0]);

  let currentRuleResult;
  /**
   *
   * @type {Map<string, ReportRule>}
   */
  let ruleIdToRuleExecutionResult = new Map();

  /**
   *
   * @type {Map<String, Map<string, ReportRule>}
   */
  let ruleIdToRuleExecutionListingRuleResult = new Map();

  /**
   *
   * @type {Detail}
   */
  let currentDetail;
  listingRules.forEach((rule) => {
    switch (rule.getId()) {
      case "adequate_image_count": {
        currentRuleResult = adequateImageCount(images.length, rule.getDefinitions());
        break;
      }
      case "is_video_present": {
        currentRuleResult = isVideoPresent(listingDetails, rule.getDefinitions());
        break;
      }
      case "one-variant-without-model-is-present": {
        let imageKey = []
        images.map(image => {
          if (image.getImageType() === "variant") {
            imageKey.push(image.getS3Key())
          }
        })
        currentRuleResult = variantWithoutModel(listingDetails, imageKey, imageData);
        break;
      }
      case "is_accessoy_off_model": {
        currentRuleResult = isAccessoyOffModel(listingDetails, rule.getDefinitions());
        break;
      }
    }
    let currentReportRule = new ReportRule(rule, currentRuleResult);

    ruleIdToRuleExecutionResult.set(rule.getId(), currentReportRule);
    ruleIdToRuleExecutionListingRuleResult.set("listing", ruleIdToRuleExecutionResult);
  });

  return {
    rule_execution_result: ruleIdToRuleExecutionResult,
    listing_rules_result: ruleIdToRuleExecutionListingRuleResult
  }
}

const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {});


/**
 *
 * @param {number} imagesCount
 * @param {Definition[]} ruleDefinitions
 * @returns {ExecutionResult}
 */
function adequateImageCount(imagesCount, ruleDefinitions) {
  let actualValue = imagesCount;
  return executeGenericRule(ruleDefinitions, null, actualValue);
}

function isVideoPresent(listingDetails, ruleDefinitions) {
  let actualValue = listingDetails.getIsVideoPresent();
  return executeGenericRule(ruleDefinitions, null, actualValue);
}

function isAccessoyOffModel(listingDetails, ruleDefinitions) {
  let actualValue = listingDetails.getIs_accessory_off_model();
  return executeGenericRule(ruleDefinitions, null, actualValue);
}

/**
 *
 * @param {ListingDetails} listingDetails
 * @param images
 * @param {FinalImageData}imageData
 * @returns {ExecutionResult}
 */
function variantWithoutModel(listingDetails, images, imageData) {
  const variantText = new Set(["xl", "xxl", "size", "m"]);
  images.forEach((imageKey, index) => {
    if (imageData[index + 1].getImageKey().includes(imageKey)) {
      let text = imageData[index + 1].getText().isTextPresent(variantText);
      let label = imageData[index + 1].getLabel().isLabelPresent("Person");
      let bodyDetection = imageData[index + 1].getBodyDetection().getLandmarks();

      if(!label && bodyDetection===null && !text){
         listingDetails.setOneVariantWithoutModelIsPresent(true);
      }
    }
  })
  return new ExecutionResult(true,true , listingDetails.getOneVariantWithoutModelIsPresent());
}

/**
 *
 * @param {Label[]}imageObjectData
 * @param confidenceLevel
 * @param {ListingDetails} listingDetails
 * @returns {ExecutionResult}
 */
function isSingleModelImage(imageObjectData, confidenceLevel, listingDetails) {
  // Calculation => Check if Person label has instances or not
  // If instances is present, check the instances count
  // if >1 , fail

  if (listingDetails.getIsMultipack() !== undefined && listingDetails.getIsMultipack() === true) {
    return null;
  }

  /**
   *
   * @type {number}
   */
  let personCount = 0;

  imageObjectData.forEach((objectData) => {
    if (objectData.getLabelName() === "Person" && objectData.getConfidence() > confidenceLevel) {
      personCount = objectData.getInstanceLength();
    }
  });

  return new ExecutionResult(personCount, 1, personCount == 1 ? true : false)
}

/**
 *
 * @param {Label[]}imageObjectData
 * @param {number} confidenceLevel
 * @param {ListingDetails} listingDetails
 * @returns {ExecutionResult}
 */
function isMultipackOffModel(imageObjectData, confidenceLevel, listingDetails) {

  // Only run in case of multipack,
  // If not multipack, then skip
  if (listingDetails.getIsMultipack() === undefined || listingDetails.getIsMultipack() === false) {
    return null;
  }

  /**
   *
   * @type {boolean}
   */
  let isPersonAvailable = false;

  imageObjectData.forEach((objectData) => {
    if (objectData.getLabelName() === "Person" && objectData.getConfidence() > confidenceLevel) {
      isPersonAvailable = true;
    }
  });

  return new ExecutionResult(undefined, undefined, !isPersonAvailable)
}

function isAccessoriesModleExist(imageObjectData, confidenceLevel) {

  /**
   *
   * @type {boolean}
   */
  let isPersonAvailable = false;

  imageObjectData.forEach((objectData) => {
    if (objectData.getLabelName() === "Person" && objectData.getConfidence() > confidenceLevel) {
      isPersonAvailable = true;
    }
  });

  return new ExecutionResult(undefined, undefined, isPersonAvailable)
}


/**
 *
 * @param {Label[]}imageObjectData
 * @param {number} confidenceLevel
 * @param {Definition[]}definitions
 * @returns {ExecutionResult}
 */
function isModelFillingMajorityImageArea(imageObjectData, confidenceLevel, definitions) {

  // Calculation => From the person bounding box parameters
  // (width * height * 100) > 85 (expected value)

  let coveredPercent;
  imageObjectData.forEach((objectData) => {
    if (objectData.getLabelName() === "Person" && objectData.getConfidence() > confidenceLevel) {
      let instance = objectData.getInstanceAtIndex(0);
      coveredPercent = instance.getBounding().getWidth() * instance.getBounding().getHeight() * 100;
    }
  })
  if (coveredPercent === undefined) {
    return new ExecutionResult(undefined, undefined, false);
  }

  let actualValue = coveredPercent;

  return executeGenericRule(definitions, null, actualValue);

}

/**
 *
 * @param {BodyDetection}bodyDetectionResult
 *  @param {Definition[]}definitions
 *  @param {number} confidenceLevel
 * @returns {ExecutionResult}
 */
function isModelPresentWithNoseCrop(bodyDetectionResult, definitions, confidenceLevel) {
  let result = true;
  if (!bodyDetectionResult.getBack_visible() && bodyDetectionResult.getLandmarks() != null) {
    // Check for shoulders
    let isLeftShoulderPresent = bodyDetectionResult.isBodyPartPresent("left_shoulder", confidenceLevel);
    let isRightShoulderPresent = bodyDetectionResult.isBodyPartPresent("right_shoulder", confidenceLevel);

    // Check for eyes
    let isLeftEyePresent = bodyDetectionResult.isBodyPartPresent("left_eye", confidenceLevel);
    let isRightEyePresent = bodyDetectionResult.isBodyPartPresent("right_eye", confidenceLevel);

    // Final Result => Left and Right shoulder should be present and eyes should not be present
    result = ((isLeftShoulderPresent && isRightShoulderPresent) && (!isLeftEyePresent && !isRightEyePresent));
  }
  return new ExecutionResult(undefined, undefined, result);
}

/**
 *
 * @param {BodyDetection} bodyDetectionResult
 * @param {number}confidenceLevel
 * @returns {ExecutionResult}
 */
function isWaistDown(bodyDetectionResult, confidenceLevel) {
  let result = true;
  if (bodyDetectionResult.getLandmarks() != null) {
    // Knee should be present
    let isLeftKneePresent = bodyDetectionResult.isBodyPartPresent("left_knee", confidenceLevel);
    let isRightKneePresent = bodyDetectionResult.isBodyPartPresent("right_knee", confidenceLevel);

    // Feet should be present
    let isLeftFeetPresent = bodyDetectionResult.isBodyPartPresent("left_foot_index", confidenceLevel);
    let isRightFeetPresent = bodyDetectionResult.isBodyPartPresent("right_foot_index", confidenceLevel);

    // Shoulder should not be present
    let isLeftShoulderPresent = bodyDetectionResult.isBodyPartPresent("left_shoulder", confidenceLevel);
    let isRightShoulderPresent = bodyDetectionResult.isBodyPartPresent("right_shoulder", confidenceLevel);

    // Hip should be present
    let isLeftHipPresent = bodyDetectionResult.isBodyPartPresent("left_hip", confidenceLevel);
    let isRightHipPresent = bodyDetectionResult.isBodyPartPresent("right_hip", confidenceLevel);

    // Final Result => Left and Right shoulder should not be present and feet, knee and hips should be present
    result = ((!isLeftShoulderPresent && !isRightShoulderPresent) && (isLeftFeetPresent && isRightFeetPresent) && (isLeftKneePresent && isRightKneePresent) && (isLeftHipPresent && isRightHipPresent));
  }
  return new ExecutionResult(undefined, undefined, result);
}

/**
 *
 * @param {BodyDetection}bodyDetectionResult
 *  @param {number} confidenceLevel
 * @returns {ExecutionResult}
 */
function isFullLength(bodyDetectionResult, confidenceLevel, listingDetails) {

  if (listingDetails.getIs_below_the_knee() == false) {
    return null;
  }

  let result = true;
  if (bodyDetectionResult.getLandmarks() != null) {
    // Check for shoulders
    let isLeftFeetPresent = bodyDetectionResult.isBodyPartPresent("left_foot_index", confidenceLevel);
    let isRightFeetPresent = bodyDetectionResult.isBodyPartPresent("right_foot_index", confidenceLevel);

    // Check for shoulders
    let isLeftShoulderPresent = bodyDetectionResult.isBodyPartPresent("left_shoulder", confidenceLevel);
    let isRightShoulderPresent = bodyDetectionResult.isBodyPartPresent("right_shoulder", confidenceLevel);

    // Final Result => Left and Right shoulder should be present and eyes should not be present
    result = ((isLeftFeetPresent && isRightFeetPresent) && (isLeftShoulderPresent && isRightShoulderPresent));
  }
  return new ExecutionResult(undefined, undefined, result);
}

/**
 *
 * @param {BodyDetection}bodyDetectionResult
 *  @param {number} confidenceLevel
 * @returns {ExecutionResult}
 */
function isImageAboveKnee(bodyDetectionResult, confidenceLevel, listingDetails) {
//image-not-crop-below-fingertips-and-above-knee-products
  let result = false;
  if (listingDetails.getIs_above_the_knee() == false) {
    return null;
  }
  if (bodyDetectionResult.getLandmarks() != null) {
    // Check for knee
    let isLeftKneePresent = bodyDetectionResult.isBodyPartPresent("left_foot_index", confidenceLevel);
    let isRightKneePresent = bodyDetectionResult.isBodyPartPresent("right_foot_index", confidenceLevel);
    if ((!isLeftKneePresent && !isRightKneePresent)) {

      // Check for shoulders
      let isLeftIndexPresent = bodyDetectionResult.isBodyPartPresent("left_index", confidenceLevel);
      let isRightIndexPresent = bodyDetectionResult.isBodyPartPresent("right_index", confidenceLevel);

      // Check for shoulders
      let isLeftShoulderPresent = bodyDetectionResult.isBodyPartPresent("left_shoulder", confidenceLevel);
      let isRightShoulderPresent = bodyDetectionResult.isBodyPartPresent("right_shoulder", confidenceLevel);

      // Final Result => Left and Right shoulder should be present and eyes should not be present
      result = ((isLeftShoulderPresent && isRightShoulderPresent) && (isLeftIndexPresent || isRightIndexPresent));
    }

  }

  return new ExecutionResult(undefined, undefined, result);
}

/**
 *
 * @param {BodyDetection} bodyDetectionResult
 *  @param {number} confidenceLevel
 *  @param{ListingDetails} listingDetails}
 * @returns {ExecutionResult}
 */
function isBackDetailKeySellingFeatuer(bodyDetectionResult, confidenceLevel, listingDetails) {
  let result = false;

  // Checking For Back Is Present
  let isBackPresent = bodyDetectionResult.isBodyPartPresent("back_visible", confidenceLevel);

  let backDetailResult = (isBackPresent && listingDetails.getIs_back_details_key_selling_featuer());

  return new ExecutionResult(undefined, undefined, backDetailResult);
}

class JobExecution {

  /**
   * @type {Map<String, DetailedReport>}
   */
  imageToDetailedReport

  /**
   * @type{Map<String, Map<String, ReportRule>>[]}
   */
  imageToRuleResultsExecutions

  /**
   * @type{Map<String, Map<String, ExecutionStats>>}
   */
  imageToDisplayReportCategoryStats

  /**
   * @type{Map<String, ExecutionStats>}
   */
  imageToDisplayReportStats

  /**
   * @type{Map<String, Map<String, ReportRule[]>>}
   */
  imageToImageComplianceLevel

  /**
   * @type{Map<string,string[]>}
   */
  listingRulesExecutionResults

  /**
   * @type{Map<string,Map<string,string[]>>}
   */
  detailReportListingRulesExecutionResults
  /**
   * @type {Map<string, Score>}
   */
  imageToImageScore
  /**
   *
   * @type {Map<string, number>}
   */
  categoryScores

  setCategoryScores(categoryScores) {
    this.categoryScores = categoryScores;
  }

  getCategoryScores() {
    return this.categoryScores;
  }

  setListingRulesExecutionResults(listingRulesExecutionResults) {
    this.listingRulesExecutionResults = listingRulesExecutionResults;
  }

  setDetailReportListingRules(detailReportListingRulesExecutionResults) {
    this.detailReportListingRulesExecutionResults = detailReportListingRulesExecutionResults;
  }

  setImageToImageComplianceLevel(key, imageToImageComplianceLevel) {
    this.imageToImageComplianceLevel.set(key, imageToImageComplianceLevel);
  }

  /**
   *
   * @param {Map<String, Map<String, ReportRule>>[]} imageToRuleResultsExecutions
   */
  setImageToRuleResultsExecutions(imageToRuleResultsExecutions) {
    this.imageToRuleResultsExecutions = imageToRuleResultsExecutions;
  }

  /**
   *
   * @param @type{Map<String, Map<String, ExecutionStats>>} imageToDisplayReportCategoryStats
   */
  setImageToDisplayReportCategoryStats(imageToDisplayReportCategoryStats) {
    this.imageToDisplayReportCategoryStats = imageToDisplayReportCategoryStats;
  }

  /**
   *
   * @param {Map<String, ExecutionStats>} imageToDisplayReportStats
   */
  setImageToDisplayReportStats(imageToDisplayReportStats) {
    this.imageToDisplayReportStats = imageToDisplayReportStats;
  }

  /**
   *
   * @param {Map<String, DetailedReport>} imageToDetailedReport
   */
  setImageToDetailedReport(imageToDetailedReport) {
    this.imageToDetailedReport = imageToDetailedReport;
  }

  /**
   *
   * @returns {Map<String, Map<String, ReportRule>>[]}
   */
  getImageToRuleResultsExecutions() {
    return this.imageToRuleResultsExecutions;
  }

  /**
   *
   * @returns {Map<String, Map<String, ExecutionStats>>}
   */
  getImageToDisplayReportCategoryStats() {
    return this.imageToDisplayReportCategoryStats;
  }

  /**
   *
   * @returns {Map<String, Map<String, ReportRule[]>>}
   */
  getImageToImageComplianceLevel() {
    return this.imageToImageComplianceLevel;
  }

  /**
   *
   * @returns {Map<string, string[]>}
   */
  getListingRulesExecutionResults() {
    return this.listingRulesExecutionResults;
  }

  /**
   * @type{Map<string,string[]>}
   */
  getDetailReportListingRulesExecutionResults() {
    return this.detailReportListingRulesExecutionResults;
  }

  /**
   *
   * @param {Map<string, Score>} imageToImageScore
   */
  setImageToImageScore(imageToImageScore) {
    this.imageToImageScore = imageToImageScore;
  }

  getImageToImageScore() {
    return this.imageToImageScore;
  }

  generateImageToComplianceLevelResults() {
    this.imageToImageComplianceLevel = new Map();
    this.getImageToRuleResultsExecutions().forEach(imageRulesArray => {
      for (let [key, value] of imageRulesArray.entries()) {
        let imageRulesExecutionResults = [];
        for (let [keys, rule] of value.entries()) {
          imageRulesExecutionResults.push(rule)
        }
        let groupByResult = groupBy(imageRulesExecutionResults, v => v.getComplianceLevel());
        this.setImageToImageComplianceLevel(key, groupByResult);
      }
    })
  }

  /**
   *
   * @param {Rules} rules
   * @param {string} platformName
   */
  generateListingScoreForImages(rules, platformName) {

    /**
     *
     * @type {MarketPlace}
     */
    let marketPlace = rules.getMarketPlace(platformName);

    /**
     *
     * @type {Map<string, number>}
     */
    let displayReportCategoryToWeightageMapping = marketPlace.getDisplayReportCategoryToWeightageMapping();

    /**
     *
     * @type {ListingScoreCategory[]}
     */
    let listingScoreCategories = [];

    let score = this.calculateListingCategoryScore(marketPlace);
    for (let [key, value] of displayReportCategoryToWeightageMapping.entries()) {
      let currentDisplayCategory = new ListingScoreCategory(key, score);
      listingScoreCategories.push(currentDisplayCategory);
    }

    let issues = this.generateListingScoreIssuesObject(marketPlace);

    let overallScore = this.calculateOverallListingScore(marketPlace)
    /**
     *
     * @type {ListingScore}
     */
    let listingScore = new ListingScore(listingScoreCategories, platformName, overallScore, issues);

    let categoryLabel = "Men's Fashion"
    let subCategoryLabel = "Shoes"
    let images = [
      "qc/private/_job_id/qc_wm83kpoz1/input/images/main.jpg",
      "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-1.jpg",
      "qc/private/_job_id/qc_wm83kpoz1/input/images/variant-2.jpg"

    ];

    let recommendation = new Recommendation(categoryLabel, subCategoryLabel, images);
    listingScore.setRecommendations(recommendation);
    return listingScore;
  }

  /**
   *
   * @param {MarketPlace}marketPlace
   */
  calculateListingCategoryScore(marketPlace) {

    // Logic
    // 1. Finding the failed rules in the category for the entire listing (not just image, but entire listing)
    // 2. Adding the details of the failed rules in a map to be used later
    // 3. Get the potential score for the category by adding the potential scores of rule
    // 4. Do the above step for each category and return

    /**
     *  @type {Map<string, ExecutionStats>}
     */
    let displayReportCategoryStats = new Map();

    for (let [imageId, categoryLevelStats] of this.getImageToDisplayReportCategoryStats()) {
      for (let [categoryId, categoryStats] of categoryLevelStats) {
        let listingFailedRuleId = []
        categoryStats.getFailedRuleIds().forEach(ruleId => {
          if (!listingFailedRuleId.includes(ruleId)) {
            listingFailedRuleId.push(ruleId);
          }
        })
        if (displayReportCategoryStats.has(categoryId)) {
          let existingRuleId = displayReportCategoryStats.get(categoryId).getFailedRuleIds();

          for (let newRuleId of listingFailedRuleId) {
            if (!existingRuleId.includes(newRuleId)) {
              existingRuleId.push(newRuleId);
            }
          }
          displayReportCategoryStats.set(categoryId, new ExecutionStats(undefined, existingRuleId.length, existingRuleId, undefined, undefined))
        } else {
          displayReportCategoryStats.set(categoryId, new ExecutionStats(undefined, listingFailedRuleId.length, listingFailedRuleId, undefined, undefined))
        }

      }
    }
    /**
     *
     * @type {Map<string, number>}
     */
    let categoryScores = new Map();
    for (let [categoryId, categoryFailedDetails] of displayReportCategoryStats) {
      let potentialScore = 0
      categoryFailedDetails.getFailedRuleIds().forEach(ruleId => {
        potentialScore += Math.round(marketPlace.getPotentialScoreForRuleId(ruleId));
      })
      categoryScores.set(categoryId, Math.round(potentialScore));
    }
    this.setCategoryScores(categoryScores)
    return categoryScores
  }

  /**
   *
   * @param {MarketPlace}marketPlace
   */
  calculateOverallListingScore(marketPlace) {
    // Logic
    // 1. Get Listing Category Score
    // 2. Add each category score according to its weightage in listing
    // 3. Do this for each category and get the overall listing score
    let overallScoreChange = 0;
    let categoryWeight = marketPlace.getDisplayReportCategoryToWeightageMapping()
    for (let [categoryId, categoryPotentialScore] of this.getCategoryScores().entries()) {
      overallScoreChange += (categoryPotentialScore * (categoryWeight.get(categoryId) * 100)) / 100;
    }
    return Math.round(overallScoreChange);
  }

  /**
   *
   * @param {MarketPlace}marketPlace
   * @returns {ListingScoreIssues}
   */
  generateListingScoreIssuesObject(marketPlace) {
    let complianceLevelResults = this.getImageToImageComplianceLevel();

    /**
     *
     * @type {Map<String, Set<String>>}
     */
    let complianceLevelToRuleFailures = new Map();

    // Image Level Loop
    for (let [key, value] of complianceLevelResults.entries()) {
      // Compliance Level Loop
      Object.keys(value).forEach(complianceLevelKey => {
        let failedRules = new Set();
        if (complianceLevelToRuleFailures.get(complianceLevelKey) !== undefined) {
          failedRules = complianceLevelToRuleFailures.get(complianceLevelKey);
        }
        /**
         * @type {ReportRule[]}
         */
        let ruleExecutionResults = value[complianceLevelKey];
        /**
         *
         * @type {ReportRule[]}
         */
        let filteredResults = ruleExecutionResults.filter(function (reportRule) {
          return reportRule.getResult() === false;
        })

        filteredResults.forEach(filteredResult => {
          failedRules.add(filteredResult.getRuleId());
        })
        complianceLevelToRuleFailures.set(complianceLevelKey, failedRules);
      });
    }

    // Listing Level Executions
    /**
     *
     * @type {ReportRule[]}
     */
    let listingRules = [...this.getListingRulesExecutionResults().values()];
    listingRules.forEach(rule => {
      if (rule.getResult() === false) {
        let keyCheck = complianceLevelToRuleFailures.get(rule.getComplianceLevel())
        if (keyCheck === undefined) {
          /**
           * {Set<String>} ruleValue
           */
          let ruleValue = new Set();
          ruleValue.add(rule.getRuleId())
          complianceLevelToRuleFailures.set(rule.getComplianceLevel(), ruleValue)
        } else {
          keyCheck.add(rule.getRuleId());
          complianceLevelToRuleFailures.set(rule.getComplianceLevel(), keyCheck)
        }
      }
    })

    // After the compliance level map is set, make the issue object

    let globalFailureCount = 0;
    let issuePotentialScore = 0;
    let listingIssues = new ListingScoreIssues();
    for (let [key, value] of complianceLevelToRuleFailures.entries()) {
      let issueIds = value;
      /**
       *
       * @type {Issue[]}
       */
      let complianceLevelArray = [];
      issueIds.forEach(issueId => {
        let currentIssue = new Issue(issueId, LookupValueUtil.getIssueLabel(issueId));
        complianceLevelArray.push(currentIssue);
        issuePotentialScore += Math.round(marketPlace.getPotentialScoreForRuleId(issueId));
      })
      globalFailureCount += complianceLevelArray.length;
      listingIssues[key] = complianceLevelArray;
      listingIssues.setListingCount(globalFailureCount);
      listingIssues.setImprovingScore(Math.round(issuePotentialScore));
    }
    return listingIssues;
  }

  /**
   *
   * @param {Rules} rules
   * @param {string} platformName
   * @returns {ScoreByImage}ScoreByImage
   */
  getScoreByImages(rules, platformName) {

    /**
     *
     * @type {Map<string, Score>}
     */
    let imageToImageScoreMap = this.getImageLevelScoring(rules, platformName)
    let scoreByImages = new ScoreByImage(this.getImageToImageComplianceLevel(), imageToImageScoreMap);
    return scoreByImages
  }

  /**
   *
   * @param {Rules} rules
   * @param {string} platformName
   * @returns {Map<string, Score>}
   */
  getImageLevelScoring(rules, platformName) {
    /**
     *
     * @type {MarketPlace}
     */
    let marketPlace = rules.getMarketPlace(platformName);
    let categoryMap = marketPlace.getDisplayReportCategoryToRuleMapping();
    /**
     *
     * @type {Map<string, Score>}
     */
    let scoresByImages = new Map();

    for (let [imageId, categoryLevelExecutions] of this.getImageToDisplayReportCategoryStats()) {
      let imageActualScore = 0;
      let imagePotentialScore = 0;
      for (let [categoryId, categoryStats] of categoryLevelExecutions) {
        imageActualScore += Math.round(marketPlace.getPotentialScoreForCategoryId(categoryId)) * categoryStats.getActualScore() / 100;
      }

      imagePotentialScore = 100 - Math.round(imageActualScore);

      let imageScore = new Score(Math.round(imageActualScore), imagePotentialScore);
      scoresByImages.set(imageId, imageScore)
    }
    this.setImageToImageScore(scoresByImages);
    return scoresByImages;
  }

}


class Score {

  /**
   *
   * @type {number}
   */
  actual_score;

  /**
   *
   * @type {number}
   */
  score_change;

  /**
   *
   * @param {number} actualScore
   * @param {number} potentialScore
   */
  constructor(actualScore, potentialScore) {
    this.actual_score = actualScore;
    this.score_change = potentialScore;
  }

  getActualScore() {
    return this.actual_score;
  }

  getPotentialScore() {
    return this.score_change;
  }
}

class ExecutionStats {
  totalRulesCount;
  rulesFailedCount;
  rulesPassCount;
  failedRuleIds;
  actualScore;
  potentialScore;

  /**
   *
   * @param {number} totalRulesCount
   * @param {number} rulesFailedCount
   * @param {string[]} failedRuleIds
   * @param {number} actualScore
   * @param {number} potentialScore
   */
  constructor(totalRulesCount, rulesFailedCount, failedRuleIds, actualScore, potentialScore) {
    this.totalRulesCount = totalRulesCount;
    this.rulesFailedCount = rulesFailedCount;
    this.rulesPassCount = totalRulesCount - rulesFailedCount;
    this.failedRuleIds = failedRuleIds;
    this.actualScore = actualScore;
    this.potentialScore = potentialScore;
  }

  getTotalRulesCount() {
    return this.totalRulesCount;
  }

  getFailedRulesCount() {
    return this.rulesFailedCount;
  }

  getFailedRuleIds() {
    return this.failedRuleIds;
  }

  getPassRulesCount() {
    return this.rulesPassCount;
  }

  getActualScore() {
    return this.actualScore;
  }

  getPotentialScore() {
    return this.potentialScore;
  }

}

class ExecutionResult {
  /**
   * @type {number}
   */
  expectedValue

  /**
   * @type {number}
   */
  actualValue

  /**
   * @type {Boolean}
   */
  executionResult

  /**
   * @type {string}
   */
  executionMessage

  /**
   *
   * @param {number}expectedValue
   * @param {number}actualValue
   * @param {boolean} result
   * @param {string} executionMessage
   * @param result
   */
  constructor(actualValue, expectedValue, result, executionMessage) {
    this.actualValue = actualValue;
    this.expectedValue = expectedValue;
    this.executionResult = result;
    this.executionMessage = executionMessage;
  }

  /**
   *
   * @returns {number}
   */
  getActualValue() {
    return this.actualValue;
  }

  /**
   *
   * @returns {number}
   */
  getExpectedValue() {
    return this.expectedValue;
  }

  /**
   *
   * @returns {Boolean}
   */
  getExecutionResults() {
    return this.executionResult;
  }

  /**
   *
   * @returns {string}
   */
  getExecutionMessage() {
    return this.executionMessage;
  }

  /**
   *
   * @param {string} executionMessage
   */
  setExecutionMessage(executionMessage) {
    this.executionMessage = executionMessage;
  }
}

class ReportRule {
  /**
   *
   * @param {Object} ruleJson
   * @param {ExecutionResult} result
   */
  constructor(ruleJson, result) {
    /**
     * @type {string}
     */
    this.guideline_category = ruleJson["guideline_category"];
    /**
     * @type {string}
     */
    this.compliance_level = ruleJson["compliance_level"];
    /**
     *  @type {string}
     */
    this.id = ruleJson["rule_id"];
    /**
     *  @type {string}
     */
    this.image_type = ruleJson["image_type"];
    /**
     *  @type {Boolean}
     */
    this.result = result.getExecutionResults();

    /**
     *
     * @type {string}
     */
    this.execution_message = result.getExecutionMessage();

    /**
     *
     * @type {number}
     */
    this.actual_value = result.getActualValue()

    /**
     *
     * @type {number}
     */
    this.expected_value = result.getExpectedValue()
  }

  /**
   *
   * @returns {string}
   */
  getComplianceLevel() {
    return this.compliance_level;
  }

  /**
   *
   * @returns {string}
   */
  getRuleId() {
    return this.id;
  }

  getResult() {
    return this.result;
  }

  /**
   *
   * @returns {number}actual_value
   */
  getActualValue() {
    return this.actual_value;
  }

  /**
   *
   * @returns {number}expected_value
   */
  getExpectedValue() {
    return this.expected_value;
  }

  /**
   *
   * @returns {string}
   */
  getExecutionMessage() {
    return this.execution_message;
  }
}

class Report {
  /**
   *
   * @param {ReportRule[]} reportRules
   */
  constructor(reportRules) {
    /**
     * @type {ReportRule[]}
     */
    this.rules = reportRules;
  }
}

module.exports = {
  executeAndFunction,
  executeOrFunction,
  executeASingleDefinition,
  contains,
  equals,
  groupByImages,
  lessThanEqual,
  greaterThanEqual,
  executeRules,
  executeListingRules,
  executeGenericRule,
  isSingleModelImage,
  isMultipackHasModel: isMultipackOffModel,
  isAccessoriesModleExist,
  isModelFillingMajorityImageArea,
  containsPromoText: containsNoPromoText,
  JobExecution,
  ExecutionStats,
  ExecutionResult,
  isModelCentred,
  isBackDetailKeySellingFeatuer,
};
