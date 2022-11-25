const middy = require('@middy/core');
const sqsUtils = require('../../sqs_utils');
const MyEnv = require("../property/my-env");
const {attachJobIdToLogger} = require("../util/logger-utils");

// process.env.QC_JOB_COMPLETE_NOTIFIER_QUEUE_URL ="https://sqs.us-east-2.amazonaws.com/742677111809/test-qc-job-notifier-queue"
const {Logger} = require('@aws-lambda-powertools/logger');

const logger = new Logger();

let handler = async (event) => {
  let sqsMsg = JSON.parse(event.Cause);
  let errorDetail = {
    job_id: event.job_id,
    report_s3_key: null,
    job_status: "ERROR",
    error_message: sqsMsg.errorMessage
  }
  /**
   *
   * @type {String}
   */
  let sqsResponse = await sqsUtils.sendReportToSqs(errorDetail, MyEnv.getQcJobCompleteNotifierQueueUrl());
  logger.info("SQS ID Error  ", sqsResponse);
  return errorDetail
}

exports.handler = middy()
  .use(attachJobIdToLogger(logger))
  .handler(handler);