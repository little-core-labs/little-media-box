const constants = require('../constants')
const iso639 = require('../iso-639')
const assert = require('assert')
const mutex = require('mutexify')
const {
  TrackPropertiesMissingFormatError,
  TrackPropertiesMissingStreamError
} = require('./error')

const NOT_AVAILABLE = 'N/A'

/**
 * The `TrackProperties` class represents a container for a track's
 * source stream and format properties based on a track's source
 * stream index.
 * @private
 * @class
 * @extends Map
 */
class TrackProperties extends Map {

  /**
   * `TrackProperties` class constructor.
   * @param {Track} track
   * @param {Object} opts
   */
  constructor(track, opts) {
    super()

    this.streamIndex = opts.streamIndex
    this.track = track
    this.lock = mutex()
  }

  /**
   * An object describing the track's source format. This
   * property is updated after each `update()`. This value
   * can be `null`.
   * @accessor
   * @type {?(Object)}
   */
  get format() {
    return this.get('format') || null
  }

  /**
   * An object describing the track's source stream. This
   * property is updated after each `update()`. This value
   * can be `null`.
   * @accessor
   * @type {?(Object)}
   */
  get stream() {
    return this.get('stream') || null
  }

  /**
   * The duration in seconds of the track's source stream. This
   * value is normalized for special cases where the duration
   * is normally not available on the stream probe.
   * @accessor
   * @type {Number}
   */
  get duration() {
    const { stream, format } = this

    if (!stream || !format) {
      return 0
    }

    if (NOT_AVAILABLE === stream.duration) {
      // Matroska doesn't do track-level duration, only container-level
      // So, let's take the container duration and apply it to the track.
      // Close enough, right?!
      if (constants.DEMUX_MATROSKA_WEBM_FORMAT === format.format_name) {
        return parseFloat(format.duration)
      } else {
        return 0
      }
    }

    return parseFloat(stream.duration)
  }

  /**
   * The language code for the track's source. If the track's source
   * stream or format is not  then this value will be `null`,
   * otherwise the language found in the stream's tags or format's
   * tags objects falling back 'und' (undetermined).
   * @accessor
   * @type {?(String)}
   */
  get language() {
    if (!this.stream || !this.format) { return null }

    return (
      (this.stream.tags && lookup(this.stream.tags.language)) ||
      (this.format.tags && lookup(this.format.tags.language)) ||
      iso639.codes.SPECIAL_UNDETERMINED_LANGUAGE
    )

    // lookup language
    function lookup(language) {
      if ('string' === typeof language) {
        if (language in iso639.codes) {
          return language
        } else {
          const query = iso639.codes.lookup(language, true)
          if (query.length && query[0].code) {
            return query[0].code
          }
        }
      }
    }
  }

  /**
   * Boolean to indicate if the track's source stream
   * at the stream index it points to is the primary stream
   * in the track's source "container".
   * @accessor
   * @type {Boolean}
   */
  get isPrimary() {
    if (this.stream && 1 === this.stream.disposition.default) {
      return true
    }

    return false
  }

  /**
   * Merged tags found in `format` and `stream` in the track's
   * source stream probe. The tags found in the `stream` properties
   * will overwrite tags found in `format`.
   * @accessor
   * @type {?(Object)}
   */
  get tags() {
    const { stream, format } = this

    if (!stream || !format) {
      return null
    }

    return Object.assign({}, format.tags, stream.tags)
  }

  /**
   * The name of the codec for track's source stream.
   * @accessor
   * @type {?(String)}
   */
  get codec() {
    if (!this.stream) { return null }
    return this.stream.codec_name
  }

  /**
   * The track's source stream bit rate.
   * @accessor
   * @type {?(Number)}
   */
  get bitrate() {
    if (!this.stream) { return null }
    return this.stream.bit_rate
  }

  /**
   * The number of frames in the track's source stream.
   * @accessor
   * @type {?(Number)}
   */
  get frames() {
    if (!this.stream) { return null }
    return this.stream.nb_frames
  }

  /**
   * Resets internal state calling `callback()` after it
   * is cleared
   * @param {Function} callback
   */
  reset(callback) {
    if ('function' !== typeof callback) {
      callback = noop
    }

    this.lock((release) => {
      this.clear()
      process.nextTick(release, callback, null)
    })
  }

  /**
   * Updates internal map state by probing the track's
   * source for stream and format information. This
   * function will select the correct stream based on the track's
   * stream index.
   * @param {Function} callback
   */
  update(callback) {
    assert('function' === typeof callback,
      'Expecting callback to be a function.')
    this.lock((release) => {
      this.track.source.probe((err, probe) => {
        if (err) { return callback(err) }
        const { streamIndex } = this
        const { format } = probe
        const stream = 1 === probe.streams.length
          ? probe.streams[0]
          : probe.streams.find((s) => s.index === streamIndex)

        if (!stream) {
          release(callback, new TrackPropertiesMissingStreamError())
        } else if (!format) {
          release(callback, new TrackPropertiesMissingFormatError())
        } else {
          // clear state before updating
          this.clear()
          this.set('format', format)
          this.set('stream', stream)
          this.streamIndex = stream.index

          release(callback, null)
        }
      })
    })
  }

  /**
   * Returns a safe JSON representation of the `TrackProperties`
   * instance that can be safely given to `JSON.stringify()`.
   * @return {Object}
   */
  toJSON() {
    const { stream, format, duration, language } = this
    const { id } = this.track
    return { id, stream, format, duration, language }
  }
}

/**
 * Module exports.
 */
module.exports = {
  TrackProperties
}
