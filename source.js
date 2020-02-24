const { ffmpeg } = require('./ffmpeg')
const { head } = require('simple-get')
const Resource = require('nanoresource')
const through = require('through2')
const assert = require('assert')
const getUri = require('get-uri')
const ready = require('nanoresource-ready')
const debug = require('debug')('little-media-box:source')
const path = require('path')
const once = require('once')
const pump = require('pump')
const uuid = require('uuid/v4')
const url = require('url')
const fs = require('fs')

/**
 * The `Source` class represents a container for a HTTP
 * resource or local file that can be consumed as a readable
 * stream.
 * @public
 * @class
 * @extends nanoresource
 */
class Source extends Resource {

  /**
   * Creates a new `Source` instance from input where input
   * may be another source in which the state is copied into
   * a new instance. Input may be a `Track` instance in which
   * the same applies to the `Source` instance the track points
   * to.
   * @static
   * @param {String|Source|Track|Object} uri
   * @param {?(Object)} opts
   * @return {Source}
   */
  static from (uri, opts) {
    let source = null
    let stream =  null

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    // `Source` instance given
    if (uri instanceof Source) {
      source = uri
    }

    // possibly a `Track` instance or something that "holds"
    // a source was given (quack quack duck duck)
    if (uri.source instanceof Source) {
      source = uri.source
    }

    // looks like one (quack)
    // possibly a `Stream` instance or something like that given
    // as `opts` or `uri
    if (opts.push &&  opts.pipe) {
      stream = opts
      source = stream.source || null
    } else if (uri && uri.on && uri.push && uri.pipe) {
      stream = uri
      source = stream.source || null
      uri = stream.uri || null
    }

    // create a new `Source` from existing instance copying
    // properties over allowing input `opts` to take precedence
    if (source) {
      return new this(source.uri, {
        id: opts.id || source.id,
        cwd: opts.cwd || source.cwd,
        duration: opts.duration || source.duration,
        byteLength: opts.byteLength || source.byteLength,
        stream,
      })
    }

    return new this(uri, opts)
  }

  /**
   * `Source` class constructor
   * @param {String} uri
   * @param {?(Object)} opts
   * @param {?(String)} opts.id
   * @param {?(String)} opts.cwd
   * @param {?(Stream)} opts.stream
   * @param {?(Number)} opts.duration
   * @param {?(Number)} opts.byteLength
   */
  constructor(uri, opts) {
    super()

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    this.id = opts.id || uuid()
    this.uri = uri
    this.cwd = opts.cwd || process.cwd()
    this.stream = opts.stream || null
    this.duration = opts.duration || 0
    this.byteLength = opts.byteLength || 0
  }

  /**
   * The absolute path name of the source uri.
   * @accessor
   * @type {String}
   */
  get pathname() {
    return url.parse(this.uri).pathname
  }

  /**
   * Implements the abstract `_open()` method for `nanoresource`
   * Opens the source stream and initializes internal state.
   * @protected
   * @param {Function} callback
   */
  _open(callback) {
    if (this.byteLength > 0) {
      return process.nextTick(callback, null)
    }

    // try attached stream
    if (this.stream) {
      ffmpeg(this.stream).ffprobe((err, info) => {
        if (err) { return callback() }
        this.byteLength = parseInt(info.format.size)
        callback(null)
      })
    }

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
   * Implements the abstract `_close()` method for `nanoresource`
   * Closes the source stream and resets internal state.
   * @protected
   * @param {Function} callback
   */
  _close(callback) {
    process.nextTick(callback, null)
  }

  /**
   * Wait for source to be ready (opened) calling `callback()`
   * when it is.
   * @param {Function}
   */
  ready(callback) {
    assert('function' === typeof callback,
      'Expecting callback to be a function.')
    ready(this, callback)
  }

  /**
   * Creates a read stream for the source URI.
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

    // set `source` so `Source.from(readStream)` return a valid source with state intact
    return Object.assign(readStream, { source: this })

    function onstream(err, sourceStream) {
      if (err) { return readStream.emit('error', err) }
      pump(sourceStream, readStream, onpump)
    }

    function onpump(err) {
      if (err) { return readStream.emit('error', err) }
    }
  }

  /**
   * Queries for properties about the source stream.
   * @param {?(Object)} opts
   * @param {Function} callback
   */
  probe(opts, callback) {
    if ('function' === typeof opts) {
      callback = opts
    }

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    assert('function' === typeof callback,
      'Expecting callback to be a function.')

    this.ready((err) => {
      if (err) { return callback(err) }


      const { uri } = this
      const stream = this.uri !== undefined && this.uri.includes('file://') ?
        this.uri : this.createReadStream(opts)

      this.active()
      ffmpeg(stream).ffprobe((err, info) => {
        this.inactive()
        info.format.filename = info.format.filename === 'pipe:0' ?
          path.basename(this.uri) :
          info.format.filename
        callback(err, info)
      })
    })
  }

  /**
   * An alias for `probe()`.
   * @param {Function} callback
   */
  stat(callback) {
    this.probe(callback)
  }
}

/**
 * Module exports.
 */
module.exports = {
  Source
}
