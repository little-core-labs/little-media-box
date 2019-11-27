const ffmpeg = require('fluent-ffmpeg')
const getUri = require('get-uri')
const path = require('path')

class Source {
  constructor(uri) {
    if (uri.startsWith('http')) {
      this.uri = uri
      getUri(this.uri, (err, rs) => {
        if (err) { throw new Error(err.stack || err) }
        ffmpeg(rs).ffprobe((ffErr, data) => {
          if (err) { throw new Error(ffErr) }
          this.properties = data
          this.properties.format.filename = path.basename(uri)
        })
      })
    } else {
      this.uri = path.resolve(uri)
      this.getProperties()
    }
  }

  getProperties(opts = {}) {
    ffmpeg(this.uri).ffprobe((err, data) => {
      this.properties = data
      return data
    })
  }
}


module.exports = Source
