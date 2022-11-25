function attachJobIdToLoggerMiddy(logger) {
  return {
    before: async (handler, a, b) => {
      if (handler && handler.event && handler.event.hasOwnProperty("job_id")) {
        logger.appendKeys({job_id: handler.event.job_id});//This will print the job ID always in all the loggers now.
      }
    },
    after: async (event) => {
      logger.removeKeys(["job_id"]);
    }
  };
}


module.exports = {attachJobIdToLogger: attachJobIdToLoggerMiddy}