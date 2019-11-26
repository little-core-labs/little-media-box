const Source = require('./source')
const Timecode = require('smpte-timecode')


class Track {
  constructor(source, index = 0) {
    this.source = source
    if (this.source instanceof Source) {
      this.properties = this.source.properties.streams[index]
      this.mediaType = this.properties.codec_type || ''
    } else {
      throw new Error('Invalid source provided to new Track constructor')
    }

    // Non-primary Video tracks are most likely an embedded coverart or image
    this.primary = this.properties.disposition['default'] === 1
  }
}


class Audio extends Track {
  constructor(source, index = 0) {
    super(source, index)

    this.valid = this.mediaType === 'audio'

    if (!this.valid) {
      throw new Error(`Media track at index ${index} not a valid video`)
    }
  }
}


class Subtitle extends Track {
  constructor(source, index = 0) {
    super(source, index)

    this.valid = this.mediaType === 'subtitle'

    if (!this.valid) {
      throw new Error(`Media track at index ${index} not a valid video`)
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

    if (this.primary) {
      this.getSmpteTimecode()
    }
  }

  getSmpteTimecode() {
    const dropFrameSupport = [29.97, 59.94]
    const [num, den] = this.properties.r_frame_rate.split('/')
    const t = new Date(1970, 0, 1)
    t.setSeconds(this.properties.duration)

    const fps = Number((num/den).toFixed(3))

    return this.smpteTimecode = Timecode(t, fps, (num % den !== 0 && dropFrameSupport.includes(fps)))
  }

  getImmersive() {
    const immersiveProperties = {
      projection: this.properties.projection ? this.properties.projection : 'none',
      stereoscopy: this.properties.side_data_type ? this.properties.type : '2D'
    }

    return [immersiveProperties.projection !== 'none', immersiveProperties]
  }
}


module.exports = { Audio, Subtitle, Video }
