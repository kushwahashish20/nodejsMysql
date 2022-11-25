class ErrorModel {
  /**
   * @type {string}
   */
  error_code

  /**
   * @type {string}
   */
  error_message

  /**
   *
   * @param errorCode {string}
   * @param errorMessage {string}
   */
  constructor(errorCode, errorMessage) {
    this.error_code = errorCode;
    this.error_message = errorMessage;
  }

  toJSONString() {
    return JSON.stringify({
      "error_code": this.error_code,
      "error_message": this.error_message
    })
  }
}

module.exports = ErrorModel;