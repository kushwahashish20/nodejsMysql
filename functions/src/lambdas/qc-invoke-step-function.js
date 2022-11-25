const AWS = require('aws-sdk');
const {Logger} = require('@aws-lambda-powertools/logger');

const logger = new Logger();

AWS.config.apiVersions = {
  stepfunctions: '2016-11-23',
  // other service API versions
};

const stepFunctions = new AWS.StepFunctions();

/**
 * *
 * @param body{string}
 * @return{StepFunctions.Types.StartExecutionInput}
 */
function createStepFunctionInput(body) {
  /***
   * This body is the message which we have received from the SQS queue.<br>
   * Inside the message, we have the data property which contains the actual data.<br>
   * So, we will use that as the input.
   * Example of body:
   * "{\"id\":\"qc_wdxehsrp\",\"schema\":1,\"type\":\"json\",\"status\":200,\"message\":\"OK\",\"source_type\":\"pico.server\",\"target_type\":\"aws.step-function\",\"timestamp\":1660770741850,\"event_name\":\"qc-job-start\",\"source_name\":\"SendQcJobToProcessorQueue\",\"data\":{\"job_id\":\"qc_wdxehsrp\",\"target_type\":\"URL\",\"target_value\":\"https://www.amazon.com/Ulla-Johnson-Womens-Koa-Goldenrod/dp/B09PRRWK82?s=shopbop&ref_=sb_ts\",\"platform_id\":\"AMAZON\",\"manual_upload\":true,\"image_urls\":[\"string\"]}}"
   * As you can see that, inside this our main data is present.
   * @type {{id:string, data:any}}
   */
  const parsedBody = JSON.parse(body);
  let jobId = parsedBody?.id;
  return {
    stateMachineArn: process.env.QC_STEP_FUNCTION_ARN,
    input: JSON.stringify(parsedBody.data),
    name: jobId,
    traceHeader: jobId
  };
}

/**
 *
 * @param {any} event
 * @param {*} context
 */
exports.handler = async (event, context) => {
  logger.addContext(context);
  /**
   * *
   * @type {Array<*>}
   */
  const records = event?.Records;
  logger.debug(`Received total records for QC job start: ${records?.length}`);
  try {
    if (records) {
      const executions = [];
      for (let i = 0; i < records.length; i++) {
        /**
         * *
         * @type {{body:string, messageAttributes:Object.<string> }|any}
         */
        const record = records[i];
        // noinspection JSCheckFunctionSignatures
        logger.debug("Processing record", {record: record});
        let recordInvalid = true;
        if (record) {
          if (record.body) {

            recordInvalid = false;
            /**
             *
             * @type {StepFunctions.StartExecutionInput}
             */
            let startExecutionInput = createStepFunctionInput(record.body);
            logger.info("starting step function with params.", {params: startExecutionInput})
            executions.push(stepFunctions.startExecution(startExecutionInput).promise());
          }
        }
        if (recordInvalid) {
          logger.error("This record is invalid.", {record: record});
        }
      }
      let responses = await Promise.all(executions);
      logger.debug("Submitted the jobs to step function.", {responses});
    }
  } catch (exception) {
    logger.error("Error occurred in processing records", {records: records}, exception);
  }
};
