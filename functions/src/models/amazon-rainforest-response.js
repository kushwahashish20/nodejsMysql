class AmazonRainforestResponse {

  /**
   * @type {ProductData}
   */
  #productData;

  /**
   * @type {JSON}
   */
  #data;

  constructor(rainforestResponse) {
    this.#productData = new ProductData(rainforestResponse.product);
    this.#data = rainforestResponse;
  }

  /**
   *
   * @returns {JSON}
   */
  getRawResponse() {
    return this.#data;
  }

  /**
   *
   * @returns {ProductData}
   */
  getProductData() {
    return this.#productData;
  }

}


class ProductData {

  /**
   * @type{String}
   */
  #title

  /**
   * @type {Category[]}
   */
  #categories

  /**
   * @type {string[]}
   */
  #keywords_list

  /**
   * @type {string}
   */
  #keywords

  /**
   * @type {string}
   */
  #title_excluding_variant_name

  /**
   * @type {string}
   */
  #categories_flat

  /**
   * @type {ImageEntry[]}
   */
  #images

  /**
   * @type{Boolean}
   */
  #is_video_available = false

  constructor(productData) {
    this.#categories = productData.categories;
    this.#images = productData.images;
    this.#title = productData.title;
    this.setIsVideoAvailable(productData);
    this.#keywords_list = productData.keywords_list;
    this.#keywords = productData.keywords;
    this.#categories_flat = productData.categories_flat;
    this.#title_excluding_variant_name = productData.title_excluding_variant_name;
  }

  /**
   *
   * @returns {String}
   */
  getTitle() {
    return this.#title;
  }

  /**
   *
   * @returns {number}
   */
  getCategoriesLength() {
    return this.#categories ? this.#categories.length : 0;
  }

  /**
   * @param {number} index
   * @returns {Category}
   */
  getCategoryAtIndex(index) {
    return new Category(this.#categories[index]);
  }

  /**
   *
   * @param {ProductData}product
   */
  setIsVideoAvailable(product) {
    if (product.hasOwnProperty("videos_count")) {
      this.#is_video_available = true
    }
  }

  isVideoAvailable() {
    return this.#is_video_available
  }

  /**
   *
   * @returns {ImageEntry[]}
   */
  getImages() {
    /**
     * @type {ImageEntry[]}
     */
    let images = [];
    this.#images.forEach(image => images.push(new ImageEntry(image)));
    return images;
  }

  // /**
  //  *
  //  * @returns {string[]}
  //  */
  // getKeywordList() {
  //   let keyword = []
  //   this.#keywords_list.forEach(keyword => keyword.puch(new String(keyword)));
  //   return String;
  // }

  getTitleExcludingVariantName() {
    return this.#title_excluding_variant_name;
  }

  getCategoriesFlat() {
    return this.#categories_flat;
  }

  /**
   *
   * @returns {string[]}
   */
  getKeywordList() {
    return this.#keywords_list;
  }

  /**
   *
   * @returns {string}
   */
  getKeywords() {
    return this.#keywords
  }

}

class Category {

  /**
   * @type {String}
   */
  #name

  constructor(category) {
    this.#name = category.name
  }

  /**
   *
   * @returns {String}
   */
  getCategoryName() {
    return this.#name;
  }


}

class ImageEntry {

  /**
   * @type {String}
   */
  #link

  /**
   * @type {String}
   */
  #variant

  constructor(image) {
    this.#link = image.link;
    this.#variant = image.variant;
  }

  /**
   *
   * @returns {String}
   */
  getLink() {
    return this.#link;
  }

  /**
   *
   * @returns {String}
   */
  getVariant() {
    return this.#variant;
  }
}


module.exports = AmazonRainforestResponse;