const Source = require('./source')
const Track = require('./track')

const AudioTrack = Track.AudioTrack
const SubtitleTrack = Track.SubtitleTrack
const VideoTrack = Track.VideoTrack

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
  async mux() {
    try {
      const tracks = this.tracks //copy
      const cmdOpts = ['-o', 'output.mkv', tracks.shift().source.uri]
      cmdOpts.push(
        ...tracks.filter(t => t.source.uri !== cmdOpts[2]).map(m => `+${m}`)
      )
      console.log(cmdOpts)
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = { AudioTrack, Delivery, Package, Source, SubtitleTrack, Track, VideoTrack }
