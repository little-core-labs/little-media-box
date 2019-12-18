const iso6392 = require('iso-639-2')

/**
 * Module exports.
 */
module.exports = iso6392
  .map((item) => ({
    // "T" codes are preferred over "B" codes
    // see: https://en.wikipedia.org/wiki/ISO_639-2#B_and_T_codes
    code: item.iso6392T || item.iso6392B || item.iso6391,
    name: item.name
  }))
