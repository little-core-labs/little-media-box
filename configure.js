const { ffmpeg } = require('./ffmpeg')
const settings = require('./settings')

/**
 * Configures module level settings like binary paths
 * for various commands (ffmpeg, ffprobe, mkvmerge, x264)
 * and shared settings between functions.
 * @public
 * @param {?(Object)} opts
 * @param {?(Object)} opts.bin
 * @param {?(String)} opts.bin.x264
 * @param {?(String)} opts.bin.ffmpeg
 * @param {?(String)} opts.bin.ffprobe
 */
function configure(opts) {
  if (!opts || 'object' !== typeof opts) {
    opts = {}
  }

  if (opts.bin) {
    if ('string' === typeof opts.bin.x264) {
      settings.bin.x264 = opts.bin.x264
    }

    if ('string' === typeof opts.bin.mkvmerge) {
      settings.bin.mkvmerge = opts.bin.mkvmerge
    }

    if ('string' === typeof opts.bin.ffmpeg) {
      settings.bin.ffmpeg = opts.bin.ffmpeg
    }

    if ('string' === typeof opts.bin.ffprobe) {
      settings.bin.ffprobe = opts.bin.ffprobe
    }
  }

  if (settings.bin.ffmpeg) {
    ffmpeg.setFfmpegPath(settings.bin.ffmpeg)
  }

  if (settings.bin.ffprobe) {
    ffmpeg.setFfprobePath(opts.bin.ffprobe)
  }

  return settings
}

/**
 * Module exports.
 */
module.exports = {
  configure
}
