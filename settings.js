const { FFMPEG_BIN_PATH, FFPROBE_BIN_PATH } = require('./ffmpeg')
const { MKVMERGE_BIN_PATH } = require('./mkvmerge')
const { X264_BIN_PATH } = require('./x264')

/**
 * A static object to encapsulate shared settings between
 * the module such as binary paths, default values, and more.
 * @public
 * @default
 */
const settings = {

  /**
   * Binary paths for various commands used internally within
   * the module.
   */
  bin: {
    x264: X264_BIN_PATH,
    ffmpeg: FFMPEG_BIN_PATH,
    ffprobe: FFPROBE_BIN_PATH,
    mkvmerge: MKVMERGE_BIN_PATH,
  }
}

/**
 * Module exports.
 */
module.exports = settings
