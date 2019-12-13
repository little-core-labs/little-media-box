const { platform } = process

/**
 * Static `mkvmerge(1)` binary path. Will be `null`
 * if platform is not supported.
 * @public
 */
const MKVMERGE_BIN_PATH = 'linux' === platform
  ? require('mkvmerge-static-linux').path
  : ['win32', 'darwin'].includes(platform)
    ? require('mkvmerge-static').path
    : null

/**
 * Module.exports
 */
module.exports = {
  MKVMERGE_BIN_PATH
}
