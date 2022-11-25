const { LocaleService }=require('../../locales/localeservice')
const i18n=require('../../locales/i18nConfig');
class LookupValueUtil {
  static localeService = new LocaleService(i18n);

  static #LABEL = "_label";
  static #DESCRIPTION = "_desc";
  static #HOW_TO = "_how_to";
  static #SUB = "_sub_label";
  static #PASS = "_pass";
  static #PASS_LABEL = this.#PASS + this.#LABEL;
  static #PASS_DESCRIPTION = this.#PASS + this.#DESCRIPTION;
  static #LEARN = this.#HOW_TO + "_learn_more";

  /**
   *
   * @param {string} ruleId
   * @param {string} value
   * @returns {string}
   */
  static getRuleLabel(ruleId) {
    return this.localeService.translate(ruleId + this.#LABEL);
  }

  /**
   *
   * @param {string} ruleId
   * @param {string} value
   * @returns {string}
   */
  static getRuleLabelSuccess(ruleId) {
    return this.localeService.translate(ruleId + this.#PASS_LABEL);
  }


  /**
   *
   * @param {string} key
   * @returns {string}
   */
  static getSubLabelByKey(key) {
    return this.localeService.translate(key + this.#SUB);
  }

  /**
   *
   * @param {string} ruleId
   * @param {string[]} args
   * @returns {string}
   */
  static getRuleDescription(ruleId, args) {
    return this.localeService.translate(ruleId + this.#DESCRIPTION, args);
  }

  /**
   *
   * @param {string} ruleId
   * @param {string[]} args
   * @returns {string}
   */
  static getRuleDescriptionSuccess(ruleId, args) {
    return this.localeService.translate(ruleId + this.#PASS_DESCRIPTION, args);
  }

  /**
   *
   * @param {string} ruleId
   * @param {string[]} args
   * @returns {string}
   */
  static getRuleHowToLearnMore(ruleId) {
    return this.localeService.translate(ruleId + this.#LEARN);
  }

  /**
   *
   * @param {string} ruleId
   * @returns {string}
   */
  static getRuleHowTo(ruleId) {
    return this.localeService.translate(ruleId + this.#HOW_TO);
  }

  /**
   *
   * @param {string} issueId
   * @returns {string}
   */
  static getIssueLabel(issueId) {
    return this.localeService.translate(issueId + this.#LABEL);
  }

  /**
   *
   * @param {string} categoryId
   * @returns {string}
   */
  static getCategoryLabel(categoryId) {
    return this.localeService.translate(categoryId + this.#LABEL);
  }


}

module.exports = {LookupValueUtil};