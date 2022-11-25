const {Logger} = require("@aws-lambda-powertools/logger");

//const {it, expect, describe} = require("jest");

const dummyContext = {
  callbackWaitsForEmptyEventLoop: true,
  functionVersion: '$LATEST',
  functionName: 'foo-bar-function',
  memoryLimitInMB: '128',
  logGroupName: '/aws/lambda/foo-bar-function',
  logStreamName: '2021/03/09/[$LATEST]abcdef123456abcdef123456abcdef123456',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789012:function:foo-bar-function',
  awsRequestId: 'c6af9ac6-7b61-11e6-9a41-93e812345678',
  getRemainingTimeInMillis: () => 1234,
  done: () => console.log('Done!'),
  fail: () => console.log('Failed!'),
  succeed: () => console.log('Succeeded!'),
};

describe('MyUnitTest', () => {
  it('Lambda invoked successfully', async () => {
    const testEvent = {test: 'test'};
    const logger = new Logger();
    logger.addContext(dummyContext);
    const object = {
      data: "present",
      date_1: {
        a: 1
      }
    }
    logger.info("I am info with context", {record: 1}, object)
  });

});
