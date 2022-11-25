
const {handler} = require("../../../src/lambdas/qc-error-handling");



it("run-qc-error-handling-lambda", async () => {

  const event = {
    "Error": "Error",
    "Cause": "{\"errorType\":\"Error\",\"errorMessage\":\"{\\\"error_code\\\":\\\"INVALID_LISTING_URL\\\",\\\"error_message\\\":\\\"Invalid Listing URL. Check the Listing URL.\\\"}\",\"trace\":[\"Error: {\\\"error_code\\\":\\\"INVALID_LISTING_URL\\\",\\\"error_message\\\":\\\"Invalid Listing URL. Check the Listing URL.\\\"}\",\"    at amazonScrapper (/var/task/src/lambdas/qc-product-listing-details.js:185:11)\",\"    at processTicksAndRejections (node:internal/process/task_queues:96:5)\",\"    at async handler (/var/task/src/lambdas/qc-product-listing-details.js:63:28)\",\"    at async runRequest (/var/task/node_modules/@middy/core/index.cjs:89:32)\"]}"
  };

  await handler(event);
});
