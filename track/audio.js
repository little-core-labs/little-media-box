const { Track } = require('./track')

/**
 * @public
 * @const
 */
const STREAM_INDEX = 1

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
  static get STREAM_INDEX() {
    return STREAM_INDEX
  }

  /**
   * `AudioTrack` class constructor.
   * @param {Source} source
   * @param {?(Object)} opts
   */
  constructor(source, opts) {
    super(source, AudioTrack.STREAM_INDEX, opts)
  }

  /**
   * The number of channels in the track's source stream.
   * @accessor
   * @type {?(Number)}
   */
  get channels() {
    if (!this.properties.stream) { return null }
    return this.properties.stream.channels
  }

  /**
   * The channel layout of the track's source stream.
   * @accessor
   * @type {?(String)}
   */
  get channelLayout() {
    if (!this.properties.stream) { return null }
    return this.properties.stream.channel_layout
  }
}

/**
 * Module exports.
 */
module.exports = {
  AudioTrack,
  STREAM_INDEX
}
