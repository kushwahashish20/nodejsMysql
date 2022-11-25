class FetchRulesInput {
  /**
   *@type {String}
   */
  #categoryName

  /**
   * @type {String}
   */
  #productName

  /**
   * @type {Image[]}
   */
  #images

  /**
   * @type {String[]}
   */
  #imageS3Keys

  /**
   * @type {String}
   */
  #jobId

  constructor(data) {
    this.#categoryName = data.category_name;
    this.#productName = data.product_name;
    this.#imageS3Keys = data.image_s3_keys;
    this.#images = data.images;
    this.#jobId = data.job_id;
  }

  /**
   *
   * @returns {String}
   */
  getCategoryName() {
    return this.#categoryName;
  }

  /**
   *
   * @returns {String}
   */
  getProductName() {
    return this.#productName;
  }

  /**
   *
   * @returns {Image[]}
   */
  getImages() {
    /**
     *
     * @type {Image[]}
     */
    let images = [];
    this.#images.forEach(image => images.push(new Image(image)));
    return images;
  }

  /**
   *
   * @returns {String[]}
   */
  getImageS3Keys() {
    return this.#imageS3Keys;
  }

  /**
   *
   * @returns {String}
   */
  getJobId() {
    return this.#jobId;
  }

}

class Image {

  /**
   * @type {String}
   */
  #link

  /**
   * @type {String}
   */
  #type

  constructor(image) {
    this.#link = image.link;
    this.#type = image.type;
  }
}