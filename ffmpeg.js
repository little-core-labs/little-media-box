const ffmpeg = require('fluent-ffmpeg')

/**
 * Static `ffmpeg(1)` binary path.
 * @public
 */
const { FFPROBE_BIN_PATH = require('ffmpeg-ffprobe-static').ffprobePath } = process.env

/**
 * Static `ffprobe(1)` binary path.
 * @public
 */
const { FFMPEG_BIN_PATH = require('ffmpeg-static') } = process.env

// initial configuration for `ffmpeg` and `ffprobe` binary paths
// consumers of `fluent-ffmpeg` can overload the path on their own
ffmpeg.setFfmpegPath(FFMPEG_BIN_PATH)
ffmpeg.setFfprobePath(FFPROBE_BIN_PATH)

/**
 * Module exports.
 */
module.exports = {
  FFPROBE_BIN_PATH,
  FFMPEG_BIN_PATH,
  ffmpeg
}
