const iso6391 = require('iso-639-1')
const codes = iso6391.getLanguages(iso6391.getAllCodes())

/**
 * Module exports.
 */
module.exports = codes.map((item) => ({
  code: item.code,
  name: item.name
}))
