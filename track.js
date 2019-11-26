const Source = require('./source')

class Track {
  constructor(source, index = 0) {
    this.source = source
    if (this.source instanceof Source) {
      this.properties = this.source.properties.streams[index]
      this.mediaType = this.properties.codec_type || ''
    }
  }
}

class Video extends Track {
  constructor(source, index = 0) {
    super(source, index)

    this.valid = this.mediaType === 'video'

    if (!this.valid) {
      throw new Error(`Media track at index ${index} not a valid video`)
    }
  }
}

module.exports = { Track, Video }
