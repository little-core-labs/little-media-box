const ffmpeg = require('fluent-ffmpeg')

/**
 * Static `ffmpeg(1)` binary path.
 * @public
 */
const FFPROBE_BIN_PATH = require('ffprobe-static').path

/**
 * Static `ffprobe(1)` binary path.
 * @public
 */
const FFMPEG_BIN_PATH = require('ffmpeg-static').path

// configure ffmpeg/ffprobe
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
