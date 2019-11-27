const Source = require('./source')
const T = require('./track')

class MediaPackage {
  constructor(tracks, opts = {}) {
    if (tracks instanceof T.Track) {
      this.tracks = [tracks]
    } else if (Array.isArray(tracks) && tracks.every(t => t instanceof T.Track)) {
      this.tracks = tracks
    } else {
      throw new Error('Invalid tracks provided')
    }
    this.opts = opts
  }
}

module.exports = MediaPackage
