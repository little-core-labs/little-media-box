const Source = require('./source')
const T = require('./track')

class Delivery {
  constructor(sources, opts = {}) {
    if (sources instanceof Source) {
      this.sources = [sources]
    } else if (Array.isArray(sources) && sources.every(s => s instanceof Source)) {
      this.sources = sources
    } else {
      throw new Error('Invalid sources provided')
    }
    this.opts = opts
  }
}

class Package {
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

module.exports = { Delivery, Package }