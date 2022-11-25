class JobInput {
  #data;

  constructor(data) {
    this.#data = data;
  }

  /**
   * *
   * @return {string}
   */
  jobId() {
    return this.#get("job_id");
  }

  #get(key) {
    return this.#data[key];
  }

  targetType() {
    return this.#get("target_type");
  }

  targetValue() {
    return this.#get("target_value");
  }

  isUrlTarget() {
    return "URL" === this.targetType() || "url" === this.targetType();
  }

  manualUpload() {
    return this.#get("manual_upload");
  }

  raw() {
    return this.#data;
  }

  platformId() {
    return this.#get("platform_id");
  }

}


module.exports = JobInput;