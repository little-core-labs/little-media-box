const { TrackValidationError } = require('./error')
const { Track } = require('./track')

const NOT_AVAILABLE = 'N/A'

/**
 * @public
 * @const
 */
const STREAM_INDEX = 0

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
  static get STREAM_INDEX() {
    return STREAM_INDEX
  }

  /**
   * `VideoTrack` class constructor.
   * @param {Source} source
   * @param {?(Object)} opts
   */
  constructor(source, opts) {
    super(source, VideoTrack.STREAM_INDEX, opts)
  }

  /**
   * Internal validation for a video track.
   * @param {Function}
   */
  _validate(callback) {
    const { stream } = this.properties
    const exceptions = []

    if (NOT_AVAILABLE === stream.r_frame_rate) {
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
 * Module exports.
 */
module.exports =  {
  VideoTrack,
  STREAM_INDEX
}
