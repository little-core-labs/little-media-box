const { Track } = require('./track')

/**
 * @public
 * @const
 */
const STREAM_INDEX = 2

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
  static get STREAM_INDEX() {
    return STREAM_INDEX
  }

  /**
   * `SubtitleTrack` class constructor.
   * @param {Source} source
   * @param {?(Object)} opts
   */
  constructor(source, opts) {
    super(source, SubtitleTrack.STREAM_INDEX, opts)
  }
}

/**
 * Module exports.
 */
module.exports = {
  SubtitleTrack,
  STREAM_INDEX
}
