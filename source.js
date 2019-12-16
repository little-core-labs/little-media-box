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
 * Creates and returns an array of output options
 * for the source demuxer.
 * @private
 * @param {?(Array)} extras
 * @return {Array}
 */
function createDemuxOutputOptions(extras) {
  const options = ['-c', 'copy', '-f', 'matroska']
  return options.concat(extras || [])
}

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
   * @static
   * @param {String} uri
   * @param {?(Object)} opts
   * @return {Source}
   */
  static from (uri, opts) {
    if (uri instanceof Source) {
      return uri
    }

    return new this(uri, opts)
  }

  /**
   * `Source` class constructor
   * @param {String} uri
   * @param {?(Object)} opts
   * @param {?(String)} opts.id
   * @param {?(String)} opts.cwd
   */
  constructor(uri, opts) {
    super()

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    this.id = opts.id || uuid()
    this.uri = uri
    this.cwd = opts.cwd || process.cwd()
    this.duration = 0
    this.byteLength = 0
    this.demuxOptions = createDemuxOutputOptions(opts.demuxOptions)
  }

  /**
   * Implements the abstract `_open()` method for `nanoresource`
   * Opens the source stream and initializes internal state.
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

    return readStream

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
      const stream = this.createReadStream(opts)

      this.active()
      ffmpeg(stream).ffprobe((err, info) => {
        this.inactive()
        // @TODO(jwerle): remove this
        this.properties = info
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

  /**
   * Demux source into output streams. Outputs
   * @param {?(Array)} streams
   * @param {?(Object)} opts
   * @param {Function} callback
   */
  demux(streams, opts, callback) {
    if ('function' === typeof opts) {
      callback = opts
    }

    if ('function' === typeof streams) {
      callback = streams
    }

    if (!opts || 'object' !== opts) {
      opts = {}
    }

    if (false === Array.isArray(streams)) {
      streams = []
    }

    assert('function' === typeof callback,
      'Expecting callback to be a function.')

    const { cwd = this.cwd } = opts
    const { demuxOptions } = this
    const pending = []
    const outputs = new Set()
    const stream = this.createReadStream()
    const inputs = []
    const demux = ffmpeg(stream)

    const source = this

    callback = once(callback)

    this.active()
    this.probe(onprobe)

    return demux

    function onprobe(err, info) {
      if (err) { return callback(err) }

      // cherry pick streams if indices given
      if (streams.length > 0) {
        for (const index of streams) {
          inputs.push(info.streams[index])
        }
      } else {
        inputs.push(...info.streams)
      }

      for (const input of inputs) {
        const { index, codec_type, tags } = input
        const outputOptions = demuxOptions.concat([`-map 0:${index}`])
        const language = tags.language || ''
        const extname = opts.extname || '.mkv'
        const output = `${index}_${codec_type}_${language}${extname}`

        debug('demux: output:', output)
        debug('demux: options:', demuxOptions)

        demux.output(output)
        demux.outputOptions(outputOptions)

        outputs.add(path.resolve(cwd, output))
      }

      demux.on('error', onerror)
      demux.on('end', onend)

      process.nextTick(() => demux.run())
    }

    function onerror(err) {
      source.inactive()
      callback(err)
    }

    function onend(err, stdout, stderr) {
      debug('ffmpeg:', stdout)
      debug('ffmpeg:', stderr)

      if (err) {
        return callback(err)
      }

      source.inactive()
      callback(null, Array.from(outputs))
    }
  }
}

/**
 * Module exports.
 */
module.exports = {
  Source
}
