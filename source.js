const ffmpeg = require('fluent-ffmpeg')
const getUri = require('get-uri')
const path = require('path')

class Source {
  constructor(uri) {
    if (uri.startsWith('http')) {
      this.uri = uri
      return new Promise((resolve, reject) => {
        getUri(this.uri, (err, rs) => {
          if (err) { reject(err.stack || err) }
          ffmpeg(rs).ffprobe((ferr, data) => {
            if (ferr) { reject(ferr) }
            this.properties = data
            this.properties.format.filename = path.basename(uri)
            resolve(this)
          })
        })
      })
    } else {
      this.uri = path.resolve(uri)
      return this.getProperties()
    }
  }

  async getProperties(opts = {}) {
    return new Promise((resolve, reject) => {
      ffmpeg(this.uri).ffprobe((err, data) => {
        if (err) { reject(err) }
        this.properties = data
        resolve(this)
      })
    })
  }
}


module.exports = Source
