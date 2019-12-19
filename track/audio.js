const { Track } = require('./track')

/**
 * The default stream index of 'audio' streams.
 * @public
 * @const
 */
const DEFAULT_STREAM_INDEX = 1

/**
 * The stream type (codec_type) for an `AudioTrack` track.
 * @public
 * @const
 */
const STREAM_TYPE = 'audio'

/**
 * The `AudioTrack` class represents an extended `Track`
 * that targets an audio stream in the source the track
 * points to.
 * @public
 * @class
 * @extends Track
 */
class AudioTrack extends Track {

  /**
   * The default stream index for 'audio'.
   * @static
   * @accessor
   * @type {Number}
   */
  static get DEFAULT_STREAM_INDEX() {
    return DEFAULT_STREAM_INDEX
  }

  /**
   * The name of the stream type for this audio tracks.
   * @static
   * @accessor
   * @type {String}
   */
  static get STREAM_TYPE() {
    return STREAM_TYPE
  }

  /**
   * `AudioTrack` class constructor.
   * @param {Source} source
   * @param {?(Object)} opts
   */
  constructor(source, opts) {
    super(source, DEFAULT_STREAM_INDEX, opts)
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
  DEFAULT_STREAM_INDEX,
  STREAM_TYPE,

  AudioTrack
}
