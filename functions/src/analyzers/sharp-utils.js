const sharp = require("sharp");

class ImageMetadata {

  constructor(rawMetadata) {
    this.format = rawMetadata.format;
    this.width = rawMetadata.width;
    this.height = rawMetadata.height;
    this.space = rawMetadata.space;
    this.dpi = rawMetadata.density;
    this.aspect_ratio = this.width / this.height;
  }

  /**
   * @type{string}
   */
  format;
  /**
   * @type{number}
   */
  width;
  /**
   * @type{number}
   */
  height;
  /**
   * @type{string}
   */
  space;
  /**
   * @type{number}
   */
  dpi;
  /**
   * @type{number}
   */
  aspect_ratio;
}

/**
 * *
 * @param data{Buffer|Uint8Array|Blob|string|Readable}
 * @param imgName{string}
 * @return {Promise<ImageMetadata>}
 */
async function getSharpMetadata(data) {
  let rawImageMetadata = await sharp(data).metadata();
  /**
   *
   * @type {ImageMetadata}
   */
  let imageMetadata = new ImageMetadata(rawImageMetadata);
  return imageMetadata;
}


module.exports = {getSharpMetadata, ImageMetadata}