let AWS = require('aws-sdk');

/**
 *
 * @param sqsInput
 * @param queueUrl
 * @returns {Promise<String>}
 */
async function sendReportToSqs(sqsInput, queueUrl) {
  console.log("sendReportToSqs", sqsInput);
  let sqs = new AWS.SQS;

  /**
   *
   * @type {string}
   */
  let message = JSON.stringify(sqsInput);
  console.log("message", message);

  /**
   *
   * @type {{MessageBody: string, QueueUrl: string}}
   */
  let params = {
    MessageBody: message,
    QueueUrl: queueUrl
  };
  console.log("params: ", params);

  const promise = sqs.sendMessage(params).promise();

  /**
   * @type{String}
   */
  let responseData;
  await promise.then((data) => {
    console.log("Success" + JSON.stringify(data));
    responseData = data.MessageId;
  });
  return responseData;
}

module.exports = { sendReportToSqs }