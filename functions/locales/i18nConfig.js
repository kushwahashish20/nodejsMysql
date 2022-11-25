const { I18n } = require('i18n')
const  path = require('path')

const i18n = new I18n()
// minimal config
i18n.configure({
  locales: ['en'],
  defaultLocale: 'en',
  queryParameter: 'lang',
  directory: path.join(__dirname, 'locales'),
  api: {
    '__': 'translate',
    '__n': 'translateN'
  },
});
// I18n.init()

module.exports= {i18n};