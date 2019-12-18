const Resource = require('nanoresource')
const assert = require('assert')
const ready = require('nanoresource-ready')
const path = require('path')
const fs = require('fs')

/**
 * Absolute path to the built-in target configuration.
 * @public
 */
const TARGETS_DIR = path.resolve(__dirname, 'targets')

/**
 * The `Target` class represents a nanoresource to
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

    // normalize
    name = name.toLowerCase()
      .replace(/_/g, '-')

    this.cwd = opts.cwd || process.cwd()
    this.state = new Map()

    if ('.' === name[0]) {
      this.filename = path.resolve(this.cwd, name)
    } else {
      this.filename = path.resolve(TARGETS_DIR, name)
    }

    if ('.json' !== path.extname(this.filename)) {
      this.filename += '.json'
    }
  }

  /**
   * The enabled configuration for this target. This value
   * may be `null`.
   * @accessor
   * @type {?(Object)}
   */
  get config() {
    return this.state.get('config') || null
  }

  /**
   * An array of enabled options for the target.
   * @accessor
   * @type {Array}
   */
  get enabled() {
    return this.state.get('enabled') || []
  }

  /**
   * An object describing the limits of the target, such as
   * audio and video codec limitations (bit rate, channels,
   * pixel format, etc). This value can be `null`.
   * @accessor
   * @type {?(Object)}
   */
  get limits() {
    return this.state.get('limits') || null
  }

  /**
   * The name of this target. This can be the name defined in a
   * targets configuration (if defined) falling back to the base name
   * of the target filename, without the extension.
   * @accessor
   * @type {?(String)}
   */
  get name() {
    const basename = path.basename(this.filename)
    const extname = path.extname(basename)
    const name = this.state.get('name')
    return name || basename.replace(extname, '') || null
  }

  /**
   * An object containing the possible options for the target as defined
   * in the target configuration. This value can be `null`.
   * @accessor
   * @type {?(Object)}
   */
  get options() {
    return this.state.get('options') || null
  }

  /**
   * Updates the target configuration state.
   * @public
   * @param {Function} callback
   */
  update(callback) {
    fs.readFile(this.filename, (err, buffer) => {
      if (err) { return callback(err) }
      try {
        const target = JSON.parse(buffer.toString('utf8'))

        if ('string' === typeof target.enabled) {
          target.enabled = [target.enabled]
        }

        if (target.enabled && target.options) {
          const config = {}
          const defaults = target.options.defaults || {}

          for (const enabled of target.enabled) {
            const options = target.options[enabled]
            config[enabled] = Object.assign({}, defaults, options)
          }

          this.state.set('config', config)
        }

        if (Array.isArray(target.enabled)) {
          this.state.get('enabled', target.enabled)
        }

        if (target.limits && 'object' === typeof target.limits) {
          this.state.set('limits', target.limits)
        }

        if ('string' === typeof target.name) {
          this.state.set('name', target.name)
        }

        if (target.options && 'object' === typeof target.options) {
          this.state.set('options', target.options)
        }

        callback(null)
      } catch (err) {
        callback(err)
      }
    })
  }

  /**
   * Implements the abstract `_open()` method for `nanoresource`
   * Reads configuration from file system and stores state on
   * the instance calling `callback()` upon success or error.
   * @protected
   * @param {Function} callback
   */
  _open(callback) {
    this.update(callback)
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

  /**
   * Waits for target to be "ready" calling `callback()` upon
   * success or error.
   * @param {Function} callback
   */
  ready(callback) {
    ready(this, callback)
  }
}

/**
 * Module exports.
 */
module.exports = {
  TARGETS_DIR,

  Target
}
