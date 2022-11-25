const {Logger} = require('@aws-lambda-powertools/logger');
const logger = new Logger();

class JSONUtils {
  /**
   *
   * @param {any}
   * @returns {JSON}
   */
  static getJSONFromJavascriptObject(javascriptObject) {
    let jsonString = JSON.stringify(javascriptObject);
    return JSON.parse(jsonString);
  }
}

module.exports = {JSONUtils}