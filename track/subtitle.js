const { Track } = require('./track')

/**
 * The default stream index of 'subtitle' streams.
 * @public
 * @const
 */
const DEFAULT_STREAM_INDEX = 2

/**
 * The stream type (codec_type) for an `SubtitleTrack` track.
 * @public
 * @const
 */
const STREAM_TYPE = 'subtitle'

/**
 * The `SubtitleTrack` class represents an extended `Track`
 * that targets a subtitle stream in the source the track
 * points to.
 * @public
 * @class
 * @extends Track
 */
class SubtitleTrack extends Track {

  /**
   * The default stream index for 'subtitle'.
   * @static
   * @accessor
   * @type {Number}
   */
  static get DEFAULT_STREAM_INDEX() {
    return DEFAULT_STREAM_INDEX
  }

  /**
   * The name of the stream type for this subtitle track.
   * @static
   * @accessor
   * @type {String}
   */
  static get STREAM_TYPE() {
    return STREAM_TYPE
  }
}

/**
 * Module exports.
 */
module.exports = {
  DEFAULT_STREAM_INDEX,
  STREAM_TYPE,

  SubtitleTrack
}
