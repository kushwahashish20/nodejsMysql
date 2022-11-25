/**
 *
 * @param {string} URL
 * @returns {string|null} asin
 */
function scrapASIN(URL) {
  let asinRegex = RegExp(/(?:[/dp/]|$)([A-Z0-9]{10})/g);
  let asinRegexArray = URL.match(asinRegex);
  if (asinRegexArray) {
    return asinRegexArray[0].replace("/", "");
  }
  return null;
}

/**
 *
 * @param {string} url
 * @returns {string} domainName
 */
function scrapDomainName(url) {
  return new URL(url).hostname.replace("www.", '');
}

/**
 *
 * @param {string} category
 * @returns {string} category
 */
function actualCategory(category, categoryMap) {
  console.debug(" in actualCategory(category, event) method and returned QC Category", categoryMap[category]);
  let qcCategory;
  if (categoryMap[category] !== undefined) {
    qcCategory = categoryMap[category]
  }
  return qcCategory;
}

module.exports = {scrapDomainName, scrapASIN, actualCategory}