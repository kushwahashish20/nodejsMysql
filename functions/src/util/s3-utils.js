const MyEnv = require("../property/my-env");
const {LexModelBuildingService} = require('aws-sdk');
const AWS = require('aws-sdk');
const s3Client = new AWS.S3();

class S3Util {
  /**
   * @param s3Path{S3Path}
   */
  static async exists(s3Path) {
    try {
      let response = await s3Client.headObject({Bucket: s3Path.bucket, Key: s3Path.key}).promise();
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * @param {S3Path} s3Path
   * @return {Promise<S3.GetObjectOutput>}
   */
  static async getObject(s3Path) {
    const promise = s3Client.getObject({
      Bucket: s3Path.bucket,
      Key: s3Path.key
    }).promise();
    return await promise;
  }

  /**
   * Returns the string after reading the S3 file.
   * @param s3Path{S3Path}
   * @return {Promise<string>}
   */
  static async getObjectAsString(s3Path) {
    let object = await this.getObject(s3Path);
    return Buffer.from(object.Body).toString('utf8');
  }

  /**
   * Returns the JSON from S3 file.
   * @param s3Path{S3Path}
   * @return {Promise<any>}
   */
  static async getObjectAsJson(s3Path) {
    /**
     * @type {string}
     */
    let object = await this.getObjectAsString(s3Path);
    return JSON.parse(object);
  }

  /**
   *
   * @param {Buffer|Uint8Array|Blob|string|Readable} data
   * @param s3Path{S3Path}
   * @param contentType{string} Content type of the data.
   * @return {Promise<ManagedUpload.SendData>}
   */
  static async putObjectToS3(data, s3Path, contentType = "application/octet-stream") {
    /**
     * @type {S3.PutObjectRequest}
     */
    let params = {
      Body: data,
      Bucket: s3Path.bucket,
      Key: s3Path.key,
      ContentType: contentType
    };
    const uploadPromise = s3Client.upload(params).promise();
    return await uploadPromise;
  }
}

/**
 * @param {S3Path} s3Path
 * @return {Promise<S3.GetObjectOutput>}
 */
async function getObjectFromS3(s3Path) {
  return S3Util.getObject(s3Path);
}


class S3Path {
  #bucket;
  #key;

  /**
   * @param buket{string}
   * @param key{string}
   */
  constructor(buket, key) {
    this.#bucket = buket;
    this.#key = key;
  }

  /**
   * @return {string}
   */
  get bucket() {
    return this.#bucket;
  }

  /**
   * @return {string}
   */
  get key() {
    return this.#key;
  }

  toString() {
    return "s3://" + this.#bucket + "/" + this.#key;

  }

  /**
   * @param bucket{string}
   * @param key{string}
   * @return {S3Path}
   */
  static create(bucket, key) {
    return new S3Path(bucket, key);
  }
}

class QCS3PathsClass {
  /**
   * @type{string}
   */
  #bucket;

  constructor() {
    this.#bucket = MyEnv.getBucket();
  }

  getBucket() {
    return this.#bucket;
  }

  /**
   * @param jobId{string}
   * @return {S3Path}
   */
  getFileToStoreRainforestResultFile(jobId) {
    return S3Path.create(this.#bucket, "qc/private/_job_id/" + jobId + "/rainforest-response.json");
  }

  getRulesFilePath() {
    return S3Path.create(this.#bucket, MyEnv.getRulesFilePath());

  }

  getCatagories() {
    return S3Path.create(this.#bucket, MyEnv.getCategoryFilePath());

  }

  getFilterListKeywordsPath() {
    return S3Path.create(this.#bucket, MyEnv.getFilterListKeywordsPath());

  }
}

/**
 * @type {QCS3PathsClass}
 */
const QCS3Paths = new QCS3PathsClass();


module.exports = {getObjectFromS3, S3Path, QCS3Paths, S3Util};