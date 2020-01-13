const { TrackProperties } = require('./properties')
const { Source } = require('../source')
const Resource = require('nanoresource')
const assert = require('assert')
const ready = require('nanoresource-ready')
const debug = require('debug')('little-media-box:track')
const uuid = require('uuid/v4')

const {
  TrackPropertiesMissingFormatError,
  TrackPropertiesMissingStreamError,
  TrackTypeMismatchError
} = require('./error')

// quick util
const toTrackTypeName = (f) => f.name.toLowerCase().replace('track', '')
const noop = () => void 0

/**
 * The `Track` class represents a base class for other track classes
 * such as `VideoTrack`, `AudioTrack`, and `SubtitleTrack`.
 * @public
 * @class
 * @extends nanoresource
 */
class Track extends Resource {

  /**
   * Creates a new `Track` instance from input where
   * input may be another track, a `Source` instance or
   * some input for creating a `Source` instance, such as
   * URI string.
   * @static
   * @param {Source|String} source
   * @param {?(Object|Number)} opts
   * @param {?(Number)} opts.streamIndex
   * @return {Track}
   */
  static from(source, opts) {
    if ('number' === typeof opts) {
      opts = { streamIndex: opts }
    }

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    // coerce source into `Source` instance
    source = Source.from(source, opts)

    // derive stream index from the class level property `DEFAULT_STREAM_INDEX`
    // where `opts.index` takes precedence and `0` is the default
    const { streamIndex = this.DEFAULT_STREAM_INDEX || 0 } = opts
    return new this(source, streamIndex, opts)
  }

  /**
   * Computes the track type name for the class.
   * @static
   * @accessor
   * @type {String}
   */
  static get STREAM_TYPE() {
    return toTrackTypeName(this)
  }

  /**
   * Default stream index for a `Track`.
   * @static
   * @accessor
   * @type {Number}
   */
  static get DEFAULT_STREAM_INDEX() {
    return 0
  }

  /**
   * `Track` class constructor.
   * @param {Source} source
   * @param {Number} streamIndex
   * @param {?(Object)} opts
   * @param {?(String)} opts.id
   */
  constructor(source, streamIndex, opts) {
    super()

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    if ('number' !== typeof streamIndex || Number.isNaN(streamIndex)) {
      streamIndex = this.constructor.DEFAULT_STREAM_INDEX
    }

    assert(source instanceof Source,
      'Expecting `source` to be an instance of `Source`.')

    assert(streamIndex >= 0,
      'Expecting `streamIndex` to be >= 0. Got: ' + streamIndex)

    this.id = opts.id || uuid()
    this.source = source
    this.properties = new TrackProperties(this, { streamIndex })
  }

  /**
   * The track's source media type represented as a string (audio, video,
   * subtitle, etc).
   *
   * The static class property `STREAM_TYPE` on the instance's class constructor
   * is used to determine the track type falling back to the class name,
   * lower cased, with the string `/track/i` removed.
   * @accessor
   * @type {String}
   */
  get type() {
    if ('STREAM_TYPE' in this.constructor) {
      return this.constructor.STREAM_TYPE
    } else {
      return toTrackTypeName(this.constructor) || 'track'
    }
  }

  /**
   * The duration in seconds of the track's source stream.
   * @accessor
   * @type {Number}
   */
  get duration() {
    return this.properties.duration
  }

  /**
   * The language code for the track's source.
   * @accessor
   * @type {String}
   */
  get language() {
    return this.properties.language
  }

  /**
   * An object of known tags found in the track's source
   * container format and stream.
   * @accessor
   * @type {?(Object)}
   */
  get tags() {
    return this.properties.tags
  }

  /**
   * This property will be `true` if the track is the primary
   * track in the source container.
   * @accessor
   * @type {Boolean}
   */
  get isPrimary() {
    return this.properties.isPrimary
  }

  /**
   * The stream index for this track.
   * @accessor
   * @type {Number}
   */
  get streamIndex() {
    return this.properties.streamIndex
  }

  /**
   * Implements the abstract `_open()` method for `nanoresource`
   * Opens the internal source stream, probes for stream information,
   * and initializes track state based on the stream index.
   * @protected
   * @param {Function} callback
   */
  _open(callback) {
    this.properties.update((err) => {
      if (err) { return callback(err) }
      if (this.type !== this.properties.stream.codec_type) {
        callback(new TrackTypeMismatchError(this))
      } else {
        callback(null)
      }
    })
  }

  /**
   * Implements the abstract `_close()` method for `nanoresource`
   * Closes the resets internal state.
   * @protected
   * @param {Function} callback
   */
  _close(callback) {
    this.properties.reset(callback)
  }

  /**
   * Default abstract method implementation for `_validate()`
   * that does nothing but call `callback` on the next tick.
   * @protected
   * @abstract
   * @param {Function} callback
   */
  _validate(callback) {
    process.nextTick(callback, null)
  }

  /**
   * Wait for track and track source to be ready (opened) calling
   * `callback()` when it is.
   * @param {Function} callback
   */
  ready(callback) {
    assert('function' === typeof callback,
      'Expecting callback to be a function.')
    ready(this, (err) => {
      if (err) { return callback(err) }
      this.source.ready(callback)
    })
  }

  /**
   * Validates the track state properties calling `_validate(callback)`
   * for extending validation. Successful validation should not throw
   * an error.
   * @param {Function} callback
   */
  validate(callback) {
    assert('function' === typeof callback,
      'Expecting callback to be a function.')
    this.ready((err) => {
      if (err) { return callback(err) }
      const { stream, format } = this.properties

      if (null === stream) {
        const error = new TrackPropertiesMissingStreamError(this)
        return callback(TrackValidationError.from(error))
      }

      if (null === format) {
        const error = new TrackPropertiesMissingFormatError(this)
        return callback(TrackValidationError.from(error))
      }

      this._validate(callback)
    })
  }
}

/**
 * Module exports.
 */
module.exports = {
  Track
}
