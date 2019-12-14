const extensions = require('./extensions')
const Resource = require('nanoresource')
const through = require('through2')
const getUri = require('get-uri')
const debug = require('debug')('little-media-box:asset')
const ready = require('nanoresource-ready')
const path = require('path')
const pump = require('pump')
const uuid = require('uuid/v4')
const url = require('url')
const fs = require('fs')

/**
 * The `Asset` class represents a container for an external asset
 * that has semantic associations with other objects.
 * @public
 * @class
 * @extends nanoresource
 */
class Asset extends Resource {

  /**
   * `Asset` class constructor.
   * @param {String} uri
   * @param {?(Object)} opts
   * @param {?(String)} opts.id
   * @param {?(String)} opts.cwd
   * @param {?(String)} opts.type
   * @param {?(Array<String>)} opts.associations
   */
  constructor(uri, opts) {
    super()

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    this.id = opts.id || uuid()
    this.uri = uri
    this.cwd = opts.cwd || process.cwd()
    this.type = opts.type || extensions.typeof(path.extname(this.uri))
    this.byteLength = 0
    this.associations = Array.from(opts.associations || [])
  }

  /**
   * Implements the abstract `_open()` method for `nanoresource`
   * Opens the asset source stream and initializes internal state.
   * @protected
   * @param {Function} callback
   */
  _open(callback) {
    const uri = url.parse(this.uri)
    if (/https?:/.test(uri.protocol)) {
      head(this.uri, (err, res) => {
        if (err) { return callback(err) }
        this.byteLength = parseInt(res.headers['content-length'])
        callback(null)
      })
    } else {
      const pathname = path.resolve(this.cwd, uri.path)
      fs.stat(pathname, (err, stats) => {
        if (err) { return callback(err) }
        this.uri = `file://${pathname}`
        this.byteLength = stats.size
        callback(null)
      })
    }
  }

  /**
   * Wait for asset to be ready (opened) calling `callback()`
   * when it is.
   * @param {Function}
   */
  ready(callback) {
    ready(this, callback)
  }

  /**
   * Creates a read stream for the asset URI.
   * @param {?(Object)} opts
   * @return {Stream}
   */
  createReadStream(opts) {
    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    const readStream = through()
    const { uri } = this

    getUri(uri, onstream)

    return readStream

    function onstream(err, sourceStream) {
      if (err) { return readStream.emit('error', err) }
      pump(sourceStream, readStream, onpump)
    }

    function onpump(err) {
      if (err) { return readStream.emit('error', err) }
    }
  }
}

/**
 * Module exports.
 */
module.exports = {
  Asset
}
