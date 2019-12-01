const Source = require('./source')
const Track = require('./track')

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
    if (tracks instanceof Track.Track) {
      this.tracks = [tracks]
    } else if (Array.isArray(tracks) && tracks.every(t => t instanceof Track.Track)) {
      this.tracks = tracks.sort((track1, track2) => {
        return track1.properties.index - track2.properties.index
      })
    } else {
      throw new Error('Invalid tracks provided')
    }
    this.opts = opts
  }
}

module.exports = { Delivery, Package, Source, Track }
