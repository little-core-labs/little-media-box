const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

class Source {
  constructor(uri) {
    this.uri = path.resolve(uri)
    this.getProperties()
  }

  getProperties(opts = {}) {
    ffmpeg(this.uri).ffprobe((err, data) => {
      this.properties = data
      return data
    })
  }
}


module.exports = Source
