const iso6391 = require('./1')
const iso6392 = require('./2')
const iso6393 = require('./3')

/**
 * The following constants below are intended to capture the
 * ISO 639 Part 1 & 2 Special Codes
 * @see {@link https://en.wikipedia.org/wiki/ISO_639-2#Special_situations}
 * @see {@link https://en.wikipedia.org/wiki/ISO_639-3#Special_codes}
 */

/**
 * The 'und' special language code is intended for cases where the language
 * in the data has not yet been identified.
 * @public
 * @const
 * @type {String}
 */
const SPECIAL_UNDETERMINED_LANGUAGE = 'und'

/**
 * The 'zxx' special language code is intended for usage when language is
 * not present at all such as the sound of an animal.
 * @public
 * @const
 * @type {String}
 */
const SPECIAL_NO_LINGUISTIC_CONTENT = 'zxx'

/**
 * The 'mul' special language code is intended for usage when multiple languages
 * are present and a single language code is required.
 * @public
 * @const
 * @type {String}
 */
const SPECIAL_NO_MULTIPLE_LANGUAGES = 'mul'

/**
 * The 'mis' special language code is intended for "miscellaneous" languages
 * that are not yet identified in any ISO standard.
 * @public
 * @const
 * @type {String}
 */
const SPECIAL_UNCODED_LANGUAGES = 'mis'

/**
 * A mapping of ISO-639 (1, 2, 3) codes to names
 * @public
 * @type {Object}
 */
const codes = [].concat(iso6391.codes, iso6392.codes, iso6393.codes)
  .reduce((exports, item) => Object.assign(exports, {
    [item.code]: {
      scope: item.scope || null,
      code: item.code,
      name: item.name || null,
      type: item.type || null
    }
  }), {})

/**
 * Performs a look up for a set of ISO 639 Part 1, 2, & 3
 * codes. Results may include "scopes" and "types" as well
 * including the language code and the human readable name.
 *
 * Callers can "filter" results by supplying a string that is compared
 * to the code of each language code item, a regular expression that tests
 * the name of a language code, or a `filter` object to filter on
 * properties like `topic` and `type` in similar ways.
 *
 * Example:
 *   // the following will find entries with 'en' language code
 *   lookup('en') // [ { scope: null, code: 'en', name: 'English', type: null } ]
 *
 *   // the following will find entries with name 'English'
 *   lookup('English') // [ { scope: 'individual', code: 'eng', name: 'English', type: 'living' }, ... ]
 *
 *   // the following will find entries that contain the word 'English'
 *   lookup('*English*') // <24 entries>
 *
 *   // the following will find entries that contain the word 'english' (case insensitive)
 *   lookup('*english*', true) // 24 entries
 *
 * @public
 * @param {Object|String} filter
 * @param {?(Object|Boolean)} opts
 * @param {?(Object|Boolean)} opts.code
 * @param {?(Object|Boolean)} opts.name
 * @param {?(Object|Boolean)} opts.type
 * @param {?(Object|Boolean)} opts.scope
 * @param {?(Boolean)} opts.insensitive
 * @return {Array<Object>}
 */
function lookup(filter, opts) {
  if ('boolean' === typeof opts) {
    opts = { insensitive: opts }
  }

  if (!opts || 'object' !== typeof opts) {
    opts = {}
  }

  if ('string' === typeof filter) {
    filter = { code: filter }
  } else if (filter instanceof RegExp) {
    filter = { name: filter }
    if (!/^\^/.test(filter.name.source)) {
      filter.name.compile('^' + filter.name.source, filter.name.flags)
    }

    if (!/\$$/.test(filter.name.source)) {
      filter.name.compile(filter.name.source + '$', filter.name.flags)
    }
  } else if (!filter || 'object' !== typeof filter) {
    filter = {}
  }

  const alias = { code: 'name' }
  const keys = ['scope', 'code', 'name', 'type']

  return Object.values(codes).reverse().filter((item) => {
    let result = true
    if (!item || 'object' !== typeof item) {
      return false
    }

    for (const key of keys) {
      if (key in filter && !test(filter[key], item[key])) {
        if (alias[key] in item && test(filter[key], item[alias[key]])) {
          result = true
        } else {
          result = false
          break
        }
      }
    }

    return result
  })

  function test(left, right) {
    if ('string' === typeof left) {
      // allow loose things like '*english*' to turn into /^.*english.*$/[i]
      const regex = left.replace(/\*/g, '.*').replace(/[.]+\*/g, '.*')
      left = RegExp(`^${regex}$`, opts.insensitive ? 'i' : '')
    }

    return left.test(right)
  }
}

/**
 * Module exports.
 */
module.exports = Object.assign(codes, {
  SPECIAL_UNDETERMINED_LANGUAGE,
  SPECIAL_NO_LINGUISTIC_CONTENT,
  SPECIAL_NO_MULTIPLE_LANGUAGES,
  SPECIAL_UNCODED_LANGUAGES,

  lookup
})
