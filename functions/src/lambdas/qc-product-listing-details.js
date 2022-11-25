const AWS = require('aws-sdk')
const axios = require('axios');
const {Logger} = require('@aws-lambda-powertools/logger');
const {scrapDomainName, actualCategory} = require('../util/qc-product-listing-utils');
const {S3Path, QCS3Paths, S3Util} = require('../util/s3-utils');
const MyEnv = require('../property/my-env');
const SellerPlatform = require("../util/seller-platform");
const {extname} = require("path");
const {attachJobIdToLogger} = require("../util/logger-utils");
const middy = require('@middy/core');
const {fetchCategoryMiddy} = require("../middy/middies");
const {fetchFilterListKeywordsMiddy} = require("../middy/middies");
const {JSONUtils} = require("../util/json-utils");
const logger = new Logger();
const JobInput = require("../models/job-input");
const AmazonRainforestResponse = require("../models/amazon-rainforest-response.js");
const ErrorModel = require("../models/error-model");
const {ImageType, ImageEntryModel} = require("../rule-engine/rule-utils");
const {MimeTypes} = require("../util/mime-types");
const ssm = new AWS.SSM();
logger.removeKeys(["job_id"]);


/**
 * *
 * @param platformId{string}
 * @return {Promise<SellerPlatform>}
 */
function findPlatform(platformId) {
  return new Promise((resolve, reject) => {
    if (SellerPlatform.toEnum(platformId) !== SellerPlatform.AMAZON) {
      // noinspection JSCheckFunctionSignatures
      logger.error("Unknown platform. We don't support this platform as of now.", {"error_code": "UNKNOWN_SELLER_PLATFORM"});
      reject(new Error("Unknown platform. We don't support this platform as of now."));
    }
    resolve(SellerPlatform.AMAZON);
  });
}

/**
 *
 * @param {string} url
 */
function validatePlatformUrl(url) {
  let domainName = scrapDomainName(url).replace(".com", '')
  if (domainName !== SellerPlatform.AMAZON.getName()) {
    logger.error("Unknown platform url. We only support Amazon url as of now.");
    let errorObject = new ErrorModel("UNKNOWN_PLATFORM_URL", "Unknown platform url. We only support Amazon url as of now.");
    throw new Error(errorObject.toJSONString());
  }
}

/**
 *
 * @param {any} event
 * @param {any} event
 * @returns {JSON} scrappedResponse
 */
let handler = async (event, {categories, keywords} = context) => {
  const jobInput = new JobInput(event);

  // logger.appendKeys({job_id: jobInput.jobId()});//This will print the job ID always in all the loggers now.
  // noinspection JSCheckFunctionSignatures
  logger.info("Incoming event.", {event: event});

  const sellerPlatform = await findPlatform(jobInput.platformId());
  validatePlatformUrl(jobInput.targetValue());
  let rainforestResponse;
  logger.debug("Calling amazonScrapper()");
  let fileToStoreRainforestResultFile = QCS3Paths.getFileToStoreRainforestResultFile(jobInput.jobId());
  if (sellerPlatform === SellerPlatform.AMAZON) {
    const fileExists = await S3Util.exists(fileToStoreRainforestResultFile);
    if (fileExists) {
      // noinspection JSCheckFunctionSignatures
      logger.debug("Found previously saved Rainforest response.", {path: fileToStoreRainforestResultFile.toString()});
      rainforestResponse = await S3Util.getObjectAsJson(fileToStoreRainforestResultFile);
    } else {
      rainforestResponse = await amazonScrapper(jobInput);
      await S3Util.putObjectToS3(JSON.stringify(rainforestResponse), fileToStoreRainforestResultFile, MimeTypes.JSON);
      // noinspection JSCheckFunctionSignatures
      logger.debug("Uploaded rainforest response to s3.", {upload_path: fileToStoreRainforestResultFile.toString()});

    }
  } else {
    // noinspection JSCheckFunctionSignatures
    logger.error("Unknown platform. We don't support this platform as of now.", {"error_code": "UNKNOWN_SELLER_PLATFORM"});
    let unknownPlatformError = new ErrorModel("UNKNOWN_PLATFORM_URL", "Unknown platform. We don't support this platform as of now.");
    throw new Error(unknownPlatformError.toJSONString());
  }


  let categoryName = findProductCategoryFromRainforestResponse(rainforestResponse, categories);
  let imageUrlToImageType = detectImageTypesFromRainforestResponse(rainforestResponse);
  let listingDetails = await getLisingDetails(rainforestResponse, keywords);
  /**
   *
   * @type {Map<string, ImageEntryModel>}
   */
  let s3KeyToImageType = await uploadImagesToS3(imageUrlToImageType, jobInput.jobId());

  const images = [...s3KeyToImageType.values()];
  /**
   *
   * @type {{images: ImageEntryModel[], category_name: string, job_id: string, platform_name: SellerPlatform.name}}
   */
  const parsedJsonResponse = {
    category_name: categoryName,
    listing_details: listingDetails,
    job_id: jobInput.jobId(),
    images: images,
    platform_name: sellerPlatform.getName()
  };
  // noinspection JSCheckFunctionSignatures
  logger.info("Execution complete returning result", {response: parsedJsonResponse});

  return parsedJsonResponse;
};

/**
 *
 * @param rainforestResponse
 * @param keywords
 * @returns {ListingDetails}
 */
async function getLisingDetails(rainforestResponse, keywords) {
  let isListingMultiPack = detectMultipack(rainforestResponse, keywords);
  let isListingBelowTheWaist = isModleBelowTheWaist(rainforestResponse, keywords);
  let isListingBelowTheKnee = isModleBelowTheKnee(rainforestResponse, keywords);
  let isListingAboveTheKnee = isModleAboveTheKnee(rainforestResponse, keywords);
  let isListingBackDetailKeySellingFeature = isBackDetailKeySellingFeature(rainforestResponse, keywords);
  // let isAccessory = isAccessories(rainforestResponse, keywords);
  let videoPresent = isVideoPresent(rainforestResponse);
  let oneVariantWithoutModelIsPresent=false;

  let listingDetails = new ListingDetails(isListingMultiPack, videoPresent, isListingAboveTheKnee, isListingBelowTheKnee, isListingBelowTheWaist, isListingBackDetailKeySellingFeature, oneVariantWithoutModelIsPresent);
  return listingDetails;
}

/**
 *
 * @param {JobInput} jobInput
 * @return {Promise<{response: any}>}
 */
async function amazonScrapper(jobInput) {
  const apikey = MyEnv.getRainforestApiKey();
  let url = undefined;
  let asin = undefined;
  let domain = undefined;
  if (jobInput.isUrlTarget()) {
    url = jobInput.targetValue();
  } else {
    //This must be an ASIN.
    asin = jobInput.targetValue();
    //Todo: In future, it is possible that Same ASIN belong to different country, in that case we need to ask for domain from user.
    domain = "amazon.com";
  }
  const excludeFields = [
    'also_bought',
    'product.search_alias',
    'product.parent_asin',
    'product.size_guide_html',
    'product.variants',
    'product.rating_breakdown',
    'product.images_flat',
    'product.feature_bullets',
    'product.feature_bullets_count',
    'product.top_reviews',
    'product.specifications',
    'product.specifications_flat',
    'product.first_available',
    'product.model_number',
    'request_info',
    'request_parameters',
    'request_metadata',
    'product.variant_asins_flat',
    'also_viewed',
    'sponsored_products',
    'brand_store',
  ];
//https://www.rainforestapi.com/docs/product-data-api/parameters/product
  let axiosResponse;
  try {
    axiosResponse = await axios({
      method: 'get',
      url: 'https://api.rainforestapi.com/request',
      params: {
        type: 'product',
        api_key: apikey,
        url: url,
        amazon_domain: domain,
        asin: asin,
        //include_fields: 'product.images,product.title,product.categories,product.rating,product.reviews_total,product.buybox_winner',
        exclude_fields: excludeFields.join(",")
      }
    });
    // noinspection JSCheckFunctionSignatures
    logger.info("Rainforest response response:", {
      data: axiosResponse.data,
      status: axiosResponse.status,
      status_text: axiosResponse.statusText
    });

  } catch (e) {
    let errorObject = new ErrorModel("RAINFOREST_API_ERROR", e.message);
    logger.error("RAINFOREST_API_ERROR", e.message);
    throw new Error(errorObject.toJSONString());
    ;
  }
  if (axiosResponse.data.hasOwnProperty('product')) {
    return axiosResponse.data;
  } else {
    let errorObject = new ErrorModel("INVALID_LISTING_URL", "Invalid Listing URL. Check the Listing URL.");
    logger.error("Invalid Listing URL. Check the Listing URL.");
    throw new Error(errorObject.toJSONString());
  }


}

exports.amazonScrapper = amazonScrapper;

/**
 * *
 * @param rainforestResponse
 * @return {string} Returns the product category name.
 */
function findProductCategoryFromRainforestResponse(rainforestResponse, categoriesMap) {

  let category_name; //- Parent - most category
  /**
   * @type {AmazonRainforestResponse}
   */
  const amazonRainforestResponse = new AmazonRainforestResponse(rainforestResponse);
  /**
   * @type {ProductData}
   */
  let productData = amazonRainforestResponse.getProductData();

  /**
   * @type {number}
   */
  let categoriesLength = productData.getCategoriesLength();

  for (let i = categoriesLength - 1; i >= 0; i--) {
    /**
     *
     * @type {Category}
     */
    let category = productData.getCategoryAtIndex(i);
    /**
     *
     * @type {String}
     */
    let categoryName = category.getCategoryName();
    logger.debug(`Trying to find main category of the product. Received categories: ${categoryName}}`);
    category_name = actualCategory(categoryName, categoriesMap);
    if (category_name !== null && category_name !== undefined) {
      return category_name;
    }
  }
  logger.debug(`Resolved category for this listing is: ${category_name}`);
  if (category_name === undefined) {
    category_name = "ALL"
  }
  return category_name;
}

exports.findProductCategoryFromRainforestResponse = findProductCategoryFromRainforestResponse;

/**
 *
 * @param scrappedResponse
 * @return {Map<string,ImageType>} Returns the image URL to it''s type.
 */
function detectImageTypesFromRainforestResponse(scrappedResponse) {
  /**
   *
   * @type {Map<any, ImageType>}
   */
  const imageUrlToImageType = new Map();
  /**
   * @type {AmazonRainforestResponse}
   */
  const amazonRainforestResponse = new AmazonRainforestResponse(scrappedResponse);
  let productData = amazonRainforestResponse.getProductData();

  function isMain(image) {
    return image.getVariant() === "MAIN";
  }

  function isVariant(image) {
    // Earlier, majority of variant images were having name stared with PT,
    // But there were few instances where the varient image was as "FRNT", "TOPP"
    // This is why we are getting rid of the logic to check (starts with PT) and including them all as variants
    // Sample Link with different variant name: https://www.amazon.com/Reebok-Royal-BB4500H2-Basketball-White/dp/B07B4VH15P/ref=sr_1_8
    return image.getVariant() !== "MAIN";
  }

  let images = productData.getImages();
  images.filter((image) => {
    if (isMain(image) || isVariant(image)) {
      return true;
    }
    logger.warn("Unknown image type: " + image.getVariant());
    return false;
  }).forEach((image, index) => {
    const imageType = isMain(image) ? ImageType.MAIN : ImageType.VARIANT;
    imageUrlToImageType.set(image.getLink(), imageType);
  });
  return imageUrlToImageType;
}

/**
 *
 * @param rainforestResponse
 * @param keywords
 * @return {boolean} Returns product is multi-pack or not.
 */
function detectMultipack(rainforestResponse, keywords) {

  let multipackResponse = false;
  const amazonRainforestResponse = new AmazonRainforestResponse(rainforestResponse);
  let productData = amazonRainforestResponse.getProductData();
  let productKeywords = productData.getKeywords();
  let keywordList = productData.getKeywordList();
  let productTitle = productData.getTitle();
  let filterList = keywords.multipackFilterList;

  for (let i = 0; i < filterList.length; i++) {
    if (productTitle.toLowerCase().includes(filterList[i]) ||
      productKeywords.toString().toLowerCase().includes(filterList[i]) ||
      keywordList.toString().toLowerCase().includes(filterList[i])) {
      logger.info("product list found multi-pack")
      multipackResponse = true;
    }
  }

  logger.info("detectMultipart returning response")
  return multipackResponse
}

/**
 *
 * @param rainforestResponse
 * @param keywords
 * @return {boolean} Returns product is below-the-knee or not.
 */
function isModleBelowTheKnee(rainforestResponse, keywords) {

  let result = false;

  const amazonRainforestResponse = new AmazonRainforestResponse(rainforestResponse);
  let productData = amazonRainforestResponse.getProductData();
  let productKeywords = productData.getKeywords().toLowerCase();
  let productTitle = productData.getTitle().toLowerCase();
  let filterList = keywords.belowTheKnee;
  let titleExcludingVariantName;

  if (isFashionCategory(productData) == true) {
    for (let i = 0; i < filterList.length; i++) {
      if (productTitle.includes(filterList[i]) ||
        productKeywords.includes(filterList[i])) {
        if (productData.getTitleExcludingVariantName() != undefined || productData.hasOwnProperty("title_excluding_variant_name")) {
          titleExcludingVariantName = productData.getTitleExcludingVariantName().toLowerCase();
          if (titleExcludingVariantName.includes(filterList[i])) {
            result = true;
          }
        }
        logger.info("listing is below the knee")
        result = true;
      }
    }
  }
  return result
}

/**
 *
 * @param rainforestResponse
 * @param keywords
 * @return {boolean} Returns product is below-the-knee or not.
 */
function isModleBelowTheWaist(rainforestResponse, keywords) {

  let result = false;

  const amazonRainforestResponse = new AmazonRainforestResponse(rainforestResponse);
  let productData = amazonRainforestResponse.getProductData();
  let productKeywords = productData.getKeywords().toLowerCase();
  let productTitle = productData.getTitle().toLowerCase();
  let filterList = keywords.belowTheWaist;
  let titleExcludingVariantName;

    if(isFashionCategory(productData) === true){
        for (let i = 0; i < filterList.length; i++) {
          if(productData.getTitleExcludingVariantName() !== undefined  ||  productData.hasOwnProperty("title_excluding_variant_name")){
            titleExcludingVariantName = productData.getTitleExcludingVariantName().toLowerCase();
            if (productTitle.includes(filterList[i]) ||
              productKeywords.includes(filterList[i]) ||
              titleExcludingVariantName.includes(filterList[i])) {
              logger.info("listing is below the waist")
              result = true;
            }
          }else{
              if (productTitle.includes(filterList[i]) ||
                productKeywords.includes(filterList[i])) {
                logger.info("listing is below the waist")
                result = true;
            }
          }
        }
      }
  return result
    }

/**
 *
 * @param rainforestResponse
 * @param keywords
 * @return {boolean} Returns product is above-the-knee or not.
 */
function isModleAboveTheKnee(rainforestResponse, keywords) {

  let result = false;
  const amazonRainforestResponse = new AmazonRainforestResponse(rainforestResponse);
  let productData = amazonRainforestResponse.getProductData();
  let productKeywords = productData.getKeywords().toLowerCase();
  let productTitle = productData.getTitle().toLowerCase();
  let filterList = keywords.aboveTheKnee;
  let titleExcludingVariantName;

  if (isFashionCategory(productData) == true) {
    for (let i = 0; i < filterList.length; i++) {
      if (productTitle.includes(filterList[i]) ||
        productKeywords.includes(filterList[i])) {
        if (productData.getTitleExcludingVariantName() != undefined || productData.hasOwnProperty("title_excluding_variant_name")) {
          titleExcludingVariantName = productData.getTitleExcludingVariantName().toLowerCase();
          if (titleExcludingVariantName.includes(filterList[i])) {
            result = true;
          }
        }
        logger.info("listing is above the knee")
        result = true;
      }
    }
  }
  return result
}

/**
 *
 * @param rainforestResponse
 * @param keywords
 * @return {boolean} Returns product is back visible.
 */
function isBackDetailKeySellingFeature(rainforestResponse, keywords) {

  let result = false;
  const amazonRainforestResponse = new AmazonRainforestResponse(rainforestResponse);
  let productData = amazonRainforestResponse.getProductData();
  let productKeywords = productData.getKeywords().toLowerCase();
  let productTitle = productData.getTitle().toLowerCase();
  let filterList = keywords.backDetectionList;
  let titleExcludingVariantName;

  if (isFashionCategory(productData) == true) {
    for (let i = 0; i < filterList.length; i++) {
      if (productTitle.includes(filterList[i]) ||
        productKeywords.includes(filterList[i])) {
        if (productData.getTitleExcludingVariantName() != undefined || productData.hasOwnProperty("title_excluding_variant_name")) {
          titleExcludingVariantName = productData.getTitleExcludingVariantName().toLowerCase();
          if (titleExcludingVariantName.includes(filterList[i])) {
            result = true;
            if(result == true){
              break
            }
          }
        }
        logger.info("listing is athletic and back is visible")
        result = true;
      }
    }
  }
  return result
}

// function isAccessories(rainforestResponse, keywords) {
//
//   let result = false;
//   const amazonRainforestResponse = new AmazonRainforestResponse(rainforestResponse);
//   let productData = amazonRainforestResponse.getProductData();
//   let productKeywords = productData.getKeywords().toLowerCase();
//   let productTitle = productData.getTitle().toLowerCase();
//   let filterList = keywords.accessoriesSetectionList;
//   let titleExcludingVariantName;
//
//   if (isFashionCategory(productData) == true) {
//     for (let i = 0; i < filterList.length; i++) {
//       if (productTitle.includes(filterList[i]) ||
//         productKeywords.includes(filterList[i])) {
//         if (productData.getTitleExcludingVariantName() != undefined || productData.hasOwnProperty("title_excluding_variant_name")) {
//           titleExcludingVariantName = productData.getTitleExcludingVariantName().toLowerCase();
//           if (titleExcludingVariantName.includes(filterList[i])) {
//             result = true;
//             if(result == true){
//               break
//             }
//           }
//         }
//         logger.info("listing is accessories with no model")
//         result = true;
//       }
//     }
//   }
//   return result
// }

function isFashionCategory(productData) {
  let result = false;
  if (productData.getCategoriesFlat().includes("Clothing")) {
    result = true;
  } else {
    result = false;
  }
  return result;
}

function isVideoPresent(rainforestResponse) {

  /**
   * @type {AmazonRainforestResponse}
   */
  const amazonRainforestResponse = new AmazonRainforestResponse(rainforestResponse);

  /**
   * @type {ProductData}
   */
  let productData = amazonRainforestResponse.getProductData();
  let is_video_available = productData.isVideoAvailable()

  return is_video_available
}

/**
 *
 * @param scrappedResponse
 * @returns {ResponsePayload}
 */
function parseRainforestResponse(scrappedResponse) {
//  let listing_id = asin; //- Unique identifier for product on platform(ASINfor amazon)
  let category_name; //- Parent - most category
  /**
   * @type {AmazonRainforestResponse}
   */
  const amazonRainforestResponse = new AmazonRainforestResponse(scrappedResponse);
  /**
   * @type {ProductData}
   */
  let productData = amazonRainforestResponse.getProductData();
  /**
   * @type {ImageEntry[]}
   */
  let images = productData.getImages();
  /**
   * @type {Category}
   */
  let category = productData.getCategoryAtIndex(0);
  /**
   * @type {Category}
   */
  let categoryAtIndexOne = productData.getCategoryAtIndex(1);
  /**
   *
   * @type {number}
   */
  let categoriesLength = productData.getCategoriesLength();

  /**
   * *
   * @type {{link: string, type: string}[]}
   */
  let listing_image_urls = images.filter((image) => {
    if (image.getVariant() === "MAIN") {
      return true;
    } else {
      //if (image.getVariant().startsWith("PT"))
      // Earlier, majority of variant images were having name stared with PT,
      // But there were few instances where the varient image was as "FRNT", "TOPP"
      // This is why we are getting rid of the logic to check (starts with PT) and including them all as variants
      // Sample Link with different variant name: https://www.amazon.com/Reebok-Royal-BB4500H2-Basketball-White/dp/B07B4VH15P/ref=sr_1_8
      return true;
    }
    logger.warn("Unknown image type: " + image.getVariant());
    return false;
  }).map((image, index) => {
    return {
      link: image.getLink(),
      type: image.getVariant() === "MAIN" ? "main" : "variant"
    }

  });

  logger.debug(`Trying to find main category of the product. Received categories: ${category.getCategoryName()}}`);
  // Case 1 - Only "All Departments" category is available in the categories array ex: ('All Departments')
  if (category.getCategoryName() === "All Departments" && categoriesLength - 1 === 0) {
    category_name = actualCategory(category.getCategoryName()); //All Departments Electronics
  }
  // Case 2 - The parent-most category is found at the 0th index itself ex: ('Electronics')
  else if (category.getCategoryName() !== "All Departments") {
    category_name = actualCategory(category.getCategoryName());
  }
  // Case 3 - The parent-most category is found at the 1st index ex: ('All Departments' -> 'Electronics')
  else {
    category_name = actualCategory(categoryAtIndexOne.getCategoryName());
  }
  logger.debug(`Resolved category for this listing is: ${category_name}`);


  // noinspection JSCheckFunctionSignatures
  return new ResponsePayload({
    category_name: category_name,
    product_name: productData.getTitle(),
    images: listing_image_urls
  });
}

exports.parseRainforestResponse = parseRainforestResponse;

/**
 *
 * @param {Map<string,ImageType>} imageUrlToImageType Image URL to Image Type
 * @param {string} jobId
 * @return {Promise<Map<string,ImageEntryModel>>} return the map of S3 Key where image is uploaded to it''s type.
 */
async function uploadImagesToS3(imageUrlToImageType, jobId) {
  let index = 0;
  let uploads = [];
  /**
   * @type {Map<string, ImageEntryModel>}
   */
  const s3UrlToImageType = new Map();


  imageUrlToImageType.forEach(function (imageType, imageURL, map) {
    let extension = extname(imageURL);
    let imageName = imageType.name().toLowerCase();
    let imageId;
    if (imageType.equals(ImageType.MAIN)) {
      imageId = `${imageName}`
      imageName = `${imageName}${extension}`;
    } else if (imageType.equals(ImageType.VARIANT)) {
      let currentIndex = ++index;
      imageId = `${imageName}-${currentIndex}`
      imageName = `${imageName}-${currentIndex}${extension}`;
    }
    let s3Path = S3Path.create(MyEnv.getBucket(), "qc/private/_job_id/" + jobId + "/input/images/" + imageName);
    uploads.push(uploadImageToS3(imageURL, s3Path, MimeTypes.IMAGE_JPEG));
    const imageDetails = new ImageEntryModel({s3_key: s3Path.key, image_type: imageType.name(), image_id: imageId});
    s3UrlToImageType.set(s3Path.key, imageDetails);
  });

  await Promise.all(uploads);
  return s3UrlToImageType;
}

/**
 *
 * @param {string} url
 * @param {S3Path} s3Path
 * @param contentType{string}
 * @returns {S3Path}
 */
async function uploadImageToS3(url, s3Path, contentType) {
  const input = Buffer.from((await axios({url: url, responseType: "arraybuffer"})).data);
  await S3Util.putObjectToS3(input, s3Path);
  return s3Path;
}


class ResponsePayload {
  /**
   *
   * @param category_name
   * @param product_name
   * @param images{Array<{link:string,type:string, index:number}>}
   */
  constructor({category_name, product_name, images} = {}) {
    this.category_name = category_name;
    this.product_name = product_name;
    /**
     * @type {Array<{link: string, type: string, index: number}>}
     */
    this.images = images;
  }


  getImages() {
    return this.images;
  }

  getImageAtIndex(index) {
    return this.images[index];
  }
}

class ListingDetails {
  /**
   * @type{Boolean}
   */
  is_multipack;
  /**
   * @type {Boolean}
   */
  is_video_available;
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
  is_back_detail_key_selling_feature;
  /**
   * @type {Boolean}
   */
  is_below_the_waist;
  /**
   * @type {Boolean}
   */
  _is_accessories_off_model;

  /**
   * @type {Boolean}
   */
  is_one_variant_without_model_is_present

  /**
   *
   * @param isMultipack
   * @param isVideoAvailable
   * @param isAboveTheKnee
   * @param isBelowTheKnee
   * @param isBackDetailKeySellingFeature
   */
  constructor(isMultipack, isVideoAvailable, isAboveTheKnee, isBelowTheKnee, isBelowTheWaist, isBackDetailKeySellingFeature) {
    this.is_multipack = isMultipack;
    this.is_video_available = isVideoAvailable;
    this._is_above_the_knee = isAboveTheKnee;
    this._is_below_the_knee = isBelowTheKnee;
    this.is_back_detail_key_selling_feature = isBackDetailKeySellingFeature;
    this.is_below_the_waist = isBelowTheWaist;
    // this._is_accessories_off_model = inAccessoryOffModel;
    // this.is_one_variant_without_model_is_present=OneVariantWithoutModelIsPresent;
  }

  /**
   *
   * @returns {Boolean}
   */
  getIs_multipack() {
    return this.is_multipack;
  }

  /**
   *
   * @param {boolean}
   */
  setIs_multipack(value) {
    this.is_multipack = value;
  }

  /**
   *
   * @returns {Boolean}
   */
  getIs_video_available() {
    return this.is_video_available;
  }

  /**
   *
   * @param {Boolean}
   */
  setIs_video_available(value) {
    this.is_video_available = value;
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
    return this.is_back_detail_key_selling_feature;
  }

  /**
   *
   * @param {Boolean}
   */
  setIs_back_details_key_selling_featuer(value) {
    this.is_back_detail_key_selling_feature = value;
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

  // /**
  //  *
  //  * @param {Boolean}
  //  */
  // getIs_accessories_off_model() {
  //   return this._is_accessories_off_model;
  // }
  //
  // /**
  //  *
  //  * @param {Boolean}
  //  */
  // setIs_accessories_off_model(value) {
  //   this._is_accessories_off_model = value;
  // }
}

exports.detectMultipack = detectMultipack;
exports.isModleAboveTheKnee = isModleAboveTheKnee;
exports.isModleBelowTheKnee = isModleBelowTheKnee;
exports.isBackDetailKeySellingFeature = isBackDetailKeySellingFeature;
exports.isModleBelowTheWaist = isModleBelowTheWaist;
// exports.isAccessories = isAccessories;

exports.handler = middy()
  .use(attachJobIdToLogger(logger))
  .use(fetchCategoryMiddy())
  .use(fetchFilterListKeywordsMiddy())
  .handler(handler);
