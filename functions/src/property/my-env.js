class MyEnv {
  static getRainforestApiKey() {
    return process.env.RAINFOREST_API_KEY;
  }

  static getBucket() {
    return process.env.BUCKET_NAME;
  }

  static getRulesFilePath() {
    return process.env.RULE_FILE_KEY;
  }

  static areWeTestingWithJest() {
    return process.env.JEST_WORKER_ID !== undefined;
  }

  static getCategoryFilePath(){
    return process.env.CATEGORY_FILE_KEY;
  }

  static getFilterListKeywordsPath(){
    return process.env.FILTER_LIST_KEYWORDS_FILE_KEY;
  }

  static getQcJobCompleteNotifierQueueUrl(){
    return process.env.QC_JOB_COMPLETE_NOTIFIER_QUEUE_URL;
  }
}

module.exports = MyEnv;