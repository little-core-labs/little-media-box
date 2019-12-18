const iso6393 = require('iso-639-3')

/**
 * Module exports.
 */
module.exports = iso6393
  .map((item) => ({
    scope: item.scope,
    // "T" codes are preferred over "B" codes when using `iso-639-2` codes
    // see: https://en.wikipedia.org/wiki/ISO_639-2#B_and_T_codes
    code: item.iso6393 || item.iso6392T || item.iso6392B || item.iso6391,
    type: item.type,
    name: item.name
  }))
