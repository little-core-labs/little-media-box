const { EventEmitter } = require('events')
const { Source } = require('./source')
const { demux } = require('./demux')
const { Pool } = require('nanoresource-pool')
const assert = require('assert')
const Batch = require('batch')
const uuid = require('uuid/v4')
const os = require('os')

/**
 * Default concurrency of source probing (`ffprobe`).
 * @private
 */
const DEFAULT_PROBE_CONCURRENCY = 2 * os.cpus().length

/**
 * Default concurrency of source probing (`ffmpeg`).
 * @private
 */
const DEFAULT_DEMUX_CONCURRENCY = os.cpus().length

/**
 * The `Delivery` class represents a container of multiple
 * sources.
 * @public
 * @class
 * @extends nanoresource-pool
 */
class Delivery extends Pool {

  /**
   * `Delivery` class constructor.
   * @param {?(Object)} opts
   * @param {?(String)} opts.id
   */
  constructor(opts) {
    super(Source, opts)

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    this.id = opts.id || uuid()
  }

  /**
   * All sources in the delivery pool, including
   * child delivery pools.
   * @accessor
   * @type {Array<Source>}
   */
  get sources() {
    return this.query()
  }

  /**
   * Creates and adds a new source from a URI.
   * @param {String} uri
   * @param {?(Object} opts
   * @return {Source}
   */
  source(uri, opts) {
    return this.resource(uri, opts)
  }

  /**
   * Probes all sources in delivery pool.
   * @param {?(Object} opts
   * @param {Function} callback
   */
  probe(opts, callback) {
    if ('function' === typeof opts) {
      callback = opts
    }

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    assert('function' === typeof callback, 'callback is not a function')

    const { concurrency = DEFAULT_PROBE_CONCURRENCY } = opts
    const { sources } = this
    const probes = {}
    const batch = new Batch().concurrency(concurrency)

    for (const source of sources) {
      batch.push((next) => {
        source.probe((err, info) => {
          if (err) { return next(err) }
          probes[source.uri] = info
          next(null)
        })
      })
    }

    batch.end((err) => {
      if (err) { return callback(err) }
      callback(null, probes)
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
   * Demux sources into output streams. Outputs
   * @param {?(Object)} opts
   * @param {Function} callback
   * @return {EventEmitter}
   */
  demux(opts, callback) {
    if ('function' === typeof opts) {
      callback = opts
    }

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    assert('function' === typeof callback, 'callback is not a function')

    const { concurrency = DEFAULT_PROBE_CONCURRENCY } = opts
    const { sources } = this
    const demuxes = {}
    const emitter = new EventEmitter()
    const batch = new Batch()

    batch.concurrency(concurrency)
    emitter.setMaxListeners(0)

    for (const source of sources) {
      batch.push((next) => {
        const demuxer = demux(source, opts, (err, outputs) => {
          if (err) { return next(err) }
          demuxes[source.uri] = outputs
          next(null)
        })

        const proxy = (event) => {
          demuxer.on(event, (...args) => {
            emitter.emit(event, ...args.concat(source))
          })
        }

        proxy('codecData')
        proxy('end')
        proxy('error')
        proxy('progress')
        proxy('start')
        proxy('stderr')
      })
    }

    batch.end((err) => {
      if (err) { return callback(err) }
      callback(null, demuxes)
    })

    return emitter
  }
}

/**
 * Module exports.
 */
module.exports = {
  Delivery
}
