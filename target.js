const Resource = require('nanoresource')
const assert = require('assert')
const path = require('path')
const fs = require('fs')

/**
 * @public
 * @class
 * @extends Resource
 */
class Target extends Resource {

  /**
   * `Target` class constructor.
   * @param {String} name
   * @param {?(Object)} opts
   * @param {?(String)} opts.cwd
   */
  constructor(name, opts) {
    super()

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    assert(name && 'string' === typeof name,
      'Expecting name to be a string.')

    this.cwd = opts.cwd || process.cwd()
    this.config = new Map()
    this.filename = path.resolve(this.cwd, this.name)
  }

  get limits() {
    return this.config.get('limits') || null
  }

  get name() {
    return this.config.get('name') || null
  }

  /**
   * Implements the abstract `_open()` method for `nanoresource`
   * Reads configuration from file system and stores state on
   * the instance calling `callback()` upon success or error.
   * @protected
   * @param {Function} callback
   */
  _open(callback) {
    fs.readFile(this.filename, (err, buffer) => {
      if (err) { return callback(err) }
      try {
        const config = JSON.parse(buffer.toString('utf8'))
      } catch (err) {
        return callback(err)
      }
    })
  }

  /**
   * Implements the abstract `_close()` method for `nanoresource`
   * Will clear internal state calling `callback()` upon success
   * or error.
   * @protected
   * @param {Function} callback
   */
  _close(callback) {
    this.config.clear()
    process.nextTick(callback, null)
  }
}
