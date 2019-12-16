const { Source } = require('./source')
const Resource = require('nanoresource')
const assert = require('assert')
const ready = require('nanoresource-ready')
const debug = require('debug')('little-media-box:track')
const mutex = require('mutexify')
const uuid = require('uuid/v4')

// quick util
const toTrackTypeName = (f) => f.name.toLowerCase().replace('track', '')
const noop = () => void 0

/**
 * The 'Matroska/WebM' format string from `ffprobe(1)`.
 * @private
 */
const MATROSKA_WEBM_DEMUX_FORMAT = 'matroska,webm' // Matroska/WebM

/**
 * The 'undefined' or 'undetermined' language code. This is the default
 * value for track language properties if the language could not
 * be determined in the track's source probe properties.
 * @private
 */
const UNDETERMINED_LANGUAGE_CODE = 'und'

/**
 * The canonical string for representing "not available" (N/A).
 * @private
 */
const NOT_AVAILABLE_STRING = 'N/A'

/**
 * The `TrackError` class represents a base error class for
 * various errors thrown in the `Track` class and potentially
 * any subclass that extends it.
 * @public
 * @class
 * @extends Error
 */

class TrackError extends Error {

  /**
   * Creates a new `TrackError` or extended class
   * from an existing error or input.
   *
   * This is used for creating a new error from a previously
   * created `TrackError` like:
   *
   *   TrackValidationError.from(new TrackPropertiesError(track))
   *
   * will create a new `TrackValidationError` preserving the message
   * created by `TrackPropertiesError`
   * @static
   * @param {?(TrackError|Track|Mixed)} error
   * @param {...?(Mixed)} args
   * @return {TrackError}
   */
  static from(error, ...args) {
    if (error instanceof TrackError) {
      return new this(error.track, error)
    } else {
      return new this(error, ...args)
    }
  }

  /**
   * `TrackError` class constructor.
   * @param {Track} track
   * @param {?(String|Error)} message
   */
  constructor(track, message) {
    let code = null
    if (message instanceof Error) {
      code = message.code || null
      message = message.message
    }

    super(message)
    this.track = track
    if (code) {
      this.code = code
    } else if (this.constructor.code) {
      this.code = this.constructor.code
    }
  }
}

/**
 * The `TrackValidationError` class represents an error that occurs
 * during the validation of a `Track` instance.
 * @public
 * @class
 * @extends TrackError
 */
class TrackValidationError extends TrackError {

  /**
   * The `TrackValidationError` error code.
   * @accessor
   */
  get code() {
    return 'TRACK_VALIDATION_FAILED'
  }

  /**
   * The `TrackValidationError` error message.
   * @accessor
   */
  get message() {
    return 'Track validation failed.'
  }
}

/**
 * The `TrackPropertiesError` class represents an extended `TrackError`
 * class that represents a base class for various errors thrown in the
 * `TrackProperties` class.
 * @public
 * @class
 * @extends TrackError
 */
class TrackPropertiesError extends TrackError { }

/**
 * The `TrackPropertiesMissingStreamError` class represents an error that
 * occurs when the `properties.stream` property is `null` and **required**
 * in a function. The `TrackProperties` class will not throw this error, but
 * rather a consuming class that likely extends the `Track` class.
 * @public
 * @class
 * @extends TrackPropertiesError
 */
class TrackPropertiesMissingStreamError extends TrackPropertiesError {

  /**
   * The `TrackPropertiesMissingStreamError` error code.
   * @accessor
   */
  get code() {
    return 'TRACK_STREAM_NOT_FOUND'
  }

  /**
   * The `TrackPropertiesMissingStreamError` error message.
   * @accessor
   */
  get message() {
    return 'Stream information missing from track properties.'
  }
}

/**
 * The `TrackPropertiesMissingFormatError` class represents an error that
 * occurs when the `properties.format` property is `null` and **required**
 * in a function. The `TrackProperties` class will not throw this error, but
 * rather a consuming class that likely extends the `Track` class.
 * @public
 * @class
 * @extends TrackPropertiesError
 */
class TrackPropertiesMissingFormatError extends TrackPropertiesError {

  /**
   * The `TrackPropertiesMissingFormatError` error code.
   * @accessor
   */
  get code() {
    return 'TRACK_FORMAT_NOT_FOUND'
  }

  /**
   * The `TrackPropertiesMissingFormatError` error message.
   * @accessor
   */
  get message() {
    return 'Format information missing from track properties.'
  }
}

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
   */
  constructor(track) {
    super()

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

    if ('N/A' === stream.duration) {
      // Matroska doesn't do track-level duration, only container-level
      // So, let's take the container duration and apply it to the track.
      // Close enough, right?!
      if (MATROSKA_WEBM_DEMUX_FORMAT === format.format_name) {
        return parseFloat(format.duration)
      } else {
        return 0
      }
    }

    return parseFloat(stream.duration)
  }

  /**
   * The language code for the track's source. If the track's source
   * stream or format is not avialable then this value will be `null`,
   * otherwise the language found in the stream's tags or format's
   * tags objects falling back 'und' (undetermined).
   * @accessor
   * @type {?(String)}
   */
  get language() {
    const { stream, format } = this
    if (!stream || !format) {
      return null
    }

    if ('language' in stream.tags) {
      return stream.tags.language
    }

    if ('language' in format.tags) {
      return format.tags.language
    }

    return UNDETERMINED_LANGUAGE_CODE
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
      this.track.ready((err) => {
        if (err) { return calllback(err) }
        this.track.source.probe((err, probe) => {
          if (err) { return callback(err) }
          const { format } = probe
          const stream = probe.streams[this.track.streamIndex]

          // clear state before updating
          this.clear()
          this.set('format', format)
          this.set('stream', stream)

          process.nextTick(release, callback, null)
        })
      })
    })
  }

  /**
   * Returns a safe JSON representation of the `TrackProperties`
   * instance that can be safely given to `JSON.stringify()`.
   * @return {Object}
   */
  toJSON() {
    const { stream, format, duration, language }
    const { id } = this.track
    return { id, stream, format, duration, language }
  }
}

/**
 * @public
 * @class
 * @extends nanoresource
 */
class Track extends Resource {

  /**
   * @static
   * @param {Source|String} source
   * @param {?(Object)} opts
   * @param {?(Number)} opts.streamIndex
   * @return {Track}
   */
  static from(source, opts) {
    if (source instanceof Track) {
      return source
    }

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    // coerce source into `Source` instance
    source = Source.from(source)

    // derive stream index from the class level property `STREAM_INDEX`
    // where `opts.index` takes precedence and `0` is the default
    const { streamIndex = this.STREAM_INDEX || 0 } = opts
    return new this(
      source,
      'number' === typeof streamIndex ? streamIndex : 0,
      opts
    )
  }

  /**
   * Computes the track type name for the class.
   * @static
   * @accessor
   * @type {String}
   */
  static get TYPE_NAME() {
    return toTrackTypeName(this)
  }

  /**
   * `Track` class constructor.
   * @param {Source} source
   * @param {Number} streamIndex
   * @param {?(Object)} opts
   * @param {?(String)} opts.id
   */
  constructor(source, streamIndex, opts) {
    assert(source instanceof Source,
      'Expecting `source` to be an instance of `Source`.')

    assert('number' === streamIndex && streamIndex >= 0,
      'Expecting `streamIndex` to be positive integer >= 0j.')

    super()

    this.id = opts.id || uuid()
    this.index = index
    this.source = source
    this.properties = new TrackProperties(this)
  }

  /**
   * The track's source media type represented as a string (audio, video,
   * subtitle, etc).
   *
   * The static class property `TYPE_NAME` on the instance's class constructor
   * is used to determine the track type falling back to the class name,
   * lower cased, with the string `/track/i` removed.
   * @accessor
   * @type {String}
   */
  get type() {
    if ('TYPE_NAME' in this.constructor) {
      return this.constructor.TYPE_NAME
    } else {
      return toTrackTypeName(this.constructor) || 'track'
    }
  }

  /**
   * Implements the abstract `_open()` method for `nanoresource`
   * Opens the internal source stream, probes for stream information,
   * and initializes track state based on the stream index.
   * @protected
   * @param {Function} callback
   */
  _open(callback) {
    this.properties.update(callback)
  }

  /**
   * Implements the abstract `_close()` method for `nanoresource`
   * Closes the resets internal state.
   * @protected
   * @param {Function} callback
   */
  _close(callback) {
    process.nextTick(callback, null)
  }

  /**
   * TODO
   * @protected
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
    this.source.ready((err) => {
      if (err) { return callback(err) }
      ready(this, callback)
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
 * @public
 * @class
 * @extends Track
 */
class VideoTrack extends Track {

  /**
   * @static
   * @accessor
   * @type {Number}
   */
  static get STREAM_INDEX() { return 0 }

  /**
   * Internal validation for a video track.
   * @param {Function}
   */
  _validate(callback) {
    const { stream } = this.properties
    const exceptions = []

    if (NOT_AVAILABLE_STRING === stream.r_frame_rate) {
      messages.push('Stream frame rate not available.')
    }

    if (stream.nb_frames < 1) {
      messages.push('Stream frames are missing.')
    }

    if (stream.bit_rate < 1) {
      messages.push('Stream frame rate cannot be less than 1.')
    }

    if (exceptions.length) {
      const header = (
        `${messages.length} validation ` +
        `${messages.length > 1 ? 'errors' : 'error'} ` +
        `occurred`
      )

      const message = header + emessages.join(' ')
      callback(new TrackValidationError(message))
    } else {
      callback(null)
    }
  }
}

/**
 * @public
 * @class
 * @extends Track
 */
class AudioTrack extends Track {

  /**
   * @static
   * @accessor
   * @type {Number}
   */
  static get STREAM_INDEX() { return 1 }
}

/**
 * @public
 * @class
 * @extends Track
 */
class SubtitleTrack extends Track {
  /**
   * @static
   * @accessor
   * @type {Number}
   */
  static get STREAM_INDEX() { return 2 }
}

/**
 * Module exports.
 */
module.exports = {
  AudioTrack,
  SubtitleTrack,
  Track,
  VideoTrack
}
