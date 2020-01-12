const { TrackValidationError } = require('./error')
const { Track } = require('./track')

const NOT_AVAILABLE = 'N/A'

/**
 * The default stream index of 'video' streams.
 * @public
 * @const
 */
const DEFAULT_STREAM_INDEX = 0

/**
 * The stream type (codec_type) for an `VideoTrack` track.
 * @public
 * @const
 */
const STREAM_TYPE = 'video'

/**
 * The `VideoTrack` class represents an extended `Track`
 * that targets a video stream in the source the track
 * points to.
 * @public
 * @class
 * @extends Track
 */
class VideoTrack extends Track {

  /**
   * The default stream index for 'video'.
   * @static
   * @accessor
   * @type {Number}
   */
  static get DEFAULT_STREAM_INDEX() {
    return DEFAULT_STREAM_INDEX
  }

  /**
   * The name of the stream type for this 'video' track.
   * @static
   * @accessor
   * @type {String}
   */
  static get STREAM_TYPE() {
    return STREAM_TYPE
  }

  /**
   * `VideoTrack` class constructor.
   * @param {Source} source
   * @param {?(Object)} opts
   */
  constructor(source, opts) {
    super(source, DEFAULT_STREAM_INDEX, opts)
  }

  /**
   * Internal validation for a video track.
   * @param {Function}
   */
  _validate(callback) {
    const { stream } = this.properties
    const messages = []

    if (NOT_AVAILABLE === stream.r_frame_rate) {
      messages.push('Stream frame rate not available.')
    }

    if (stream.nb_frames < 1) {
      messages.push('Stream frames are missing.')
    }

    if (stream.bit_rate < 1) {
      messages.push('Stream frame rate cannot be less than 1.')
    }

    if (messages.length) {
      const header = (
        `${messages.length} validation ` +
        `${messages.length > 1 ? 'errors' : 'error'} ` +
        `occurred`
      )

      const message = header + messages.join(' ')
      callback(new TrackValidationError(message))
    } else {
      callback(null)
    }
  }
}

/**
 * Module exports.
 */
module.exports =  {
  DEFAULT_STREAM_INDEX,
  STREAM_TYPE,

  VideoTrack
}
