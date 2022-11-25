const {Image} = require('image-js');
const {Logger} = require('@aws-lambda-powertools/logger');
const logger = new Logger();

class HistogramOptions {
  /**
   *
   * @param whitePixelBandRange
   * @param percentageOfNonWhitePixels
   * @param lowerCutOff
   */
  constructor({whitePixelBandRange, percentageOfNonWhitePixels, lowerCutOff}) {
    this.whitePixelBandRange = whitePixelBandRange;
    this.percentageOfNonWhitePixels = percentageOfNonWhitePixels;
    this.lowerCutOff = lowerCutOff;
  }

  /**
   * Band of the white pixels whose sum needs and percentage value needs to be considered.
   * @type{Array<number>}
   */
  whitePixelBandRange;
  /**
   * Percentage of non-white pixels tolerated.
   * @type{number}
   */
  percentageOfNonWhitePixels;
  /**
   * The X axis lower cutoff(inclusive) upto which we have to check for the sum of tolerated non-white pixels.
   * @type{number}
   */
  lowerCutOff;
}

const DEFAULT_OPTIONS = new HistogramOptions({
  lowerCutOff: 245,
  percentageOfNonWhitePixels: 5,
  whitePixelBandRange: [255]
});

class HistogramValues {
  /**
   * @type{number[][]}
   * @private
   */
  #values;

  /**
   * @type{number[]}
   */
  #channelsToConsider;

  /**
   *
   * @param values{number[][]}
   */
  constructor(values) {
    this.#values = values;
    //For now, we are assuming RGB channels.
    this.channelsToConsider = [0, 1, 2];
  }

  getTotalNumberOfPixelsAt(index) {
    let count = 0;
    for (let channelIndex = 0; channelIndex < this.channelsToConsider.length; channelIndex++) {
      count = this.#values[channelIndex][index]
    }
    //logger.debug("Total pixels at index:", index, count);
    return count;
  }

}

/**
 *
 * @param whitePixelBandRange{number[]}
 * @param histogramValues{?HistogramValues}
 * @return {number}
 */
function countTotalWhitePixelsInGivenBand(whitePixelBandRange, histogramValues) {
  let totalNumberOfWhiteBandPixels = 0;
  for (const whitePixelIndex of whitePixelBandRange) {
    totalNumberOfWhiteBandPixels = histogramValues.getTotalNumberOfPixelsAt(whitePixelIndex);

  }
  return totalNumberOfWhiteBandPixels;
}

/**
 * *
 * @param imagePath{string}
 * @param options{HistogramOptions}
 * @return {Promise<boolean>}
 */
async function detectWhiteBackground(imagePath, options = DEFAULT_OPTIONS) {
  if (!options) {
    options = DEFAULT_OPTIONS
  } else {
    options = {...DEFAULT_OPTIONS, ...options};//_.merge({}, DEFAULT_OPTIONS, options);
  }

  logger.debug(options);

  /**
   *
   * @type {Image}
   */
  let image = await Image.load(imagePath);
  /**
   * @type {Array<Array<number>>}
   */
  let histogram = image.getHistograms({useAlpha: false});

  const histogramValues = new HistogramValues(histogram);
  let totalNumberOfWhiteBankPixels = countTotalWhitePixelsInGivenBand(options.whitePixelBandRange, histogramValues);
  logger.debug("Total number of white pixels", totalNumberOfWhiteBankPixels);
  const numberOfNonWhitePixelsWhichAreTolerated = (totalNumberOfWhiteBankPixels * options.percentageOfNonWhitePixels) / 100;
  logger.debug("Total number of non white pixels which are tolerated", numberOfNonWhitePixelsWhichAreTolerated);

  const startColorIndex = options.lowerCutOff;
  const endColorIndex = options.whitePixelBandRange[0];
  let countOfNonWhitePixels = 0;
  for (let colorIndex = startColorIndex; colorIndex < endColorIndex; colorIndex++) {
    countOfNonWhitePixels = histogramValues.getTotalNumberOfPixelsAt(colorIndex);
  }

  logger.debug("Count of non white pixels in the band", "[", startColorIndex, "-", endColorIndex, "]", "=", countOfNonWhitePixels);
  let seemsToHaveWhiteBackground = countOfNonWhitePixels <= numberOfNonWhitePixelsWhichAreTolerated;
  if (seemsToHaveWhiteBackground) {
    logger.debug("Image seems to have white background");
  }
  return seemsToHaveWhiteBackground;
}

module.exports = {
  detectWhiteBackground
}