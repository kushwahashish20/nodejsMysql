/**
 * LocaleService
 */
class LocaleService {
  /**
   *
   * @param i18nProvider The i18n provider
   */
  constructor(i18nProvider) {
    this.i18nProvider = i18nProvider;
  }

  /**
   *
   * @returns {string} The current locale code
   */
  getCurrentLocale() {
    return this.i18nProvider.getLocale();
  }

  /**
   *
   * @returns string[] The list of available locale codes
   */
  getLocales() {
    return this.i18nProvider.i18n.getLocales();
  }

  /**
   *
   * @param locale The locale to set. Must be from the list of available locales.
   */
  setLocale(locale) {
    if (this.getLocales().indexOf(locale) !== -1) {
      this.i18nProvider.setLocale(locale)
    }
  }

  /**
   *
   * @param string String to translate
   * @param args Extra parameters
   * @returns {string} Translated string
   */
  translate(string, args) {
    let dynamicParameters = [];
    dynamicParameters.push(string);
    if(args !== undefined && args.length > 0) {
      args.forEach(arg => {
        dynamicParameters.push(arg);
      })
    };
    return this.i18nProvider.i18n.__.apply(this.translate, dynamicParameters);
  }

  /**
   *
   * @param phrase Object to translate
   * @param count The plural number
   * @returns {string} Translated string
   */
  translatePlurals(phrase, count) {
    return this.i18nProvider.translateN(phrase, count)
  }
}

module.exports ={LocaleService}