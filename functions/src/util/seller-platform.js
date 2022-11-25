class SellerPlatform {

  /***
   * @type{string}
   */
  #name;

  constructor(v) {
    this.#name = v;
  }

  /**
   *
   * @param v{string}
   * @return {boolean}
   */
  static isAmazon(v) {
    v = v ? v.toLowerCase() : '';
    switch (v) {
      case this.AMAZON.#name:
        return true;
    }
    return false;
  }

  /**
   * *
   * @param v{string}
   * @return {null|SellerPlatform}
   */
  static toEnum(v) {
    if (this.isAmazon(v)) {
      return this.AMAZON;
    }
    return null;
  }

  getName() {
    return this.#name;
  }

  toString() {
    return "{platform:" + this.#name + "}";
  }

  static AMAZON = new SellerPlatform("amazon");
}

module.exports = SellerPlatform;