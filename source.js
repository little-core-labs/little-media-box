const ffmpeg = require('fluent-ffmpeg')
const getUri = require('get-uri')
const path = require('path')

class Source {
  constructor(uri) {
    this.demuxes = []
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

  async demux(opts = {}) {
    return new Promise((resolve, reject) => {
      const demuxes = []

      const demuxCmd = ffmpeg(this.uri)

      this.properties.streams.forEach(stream => {
        demuxCmd.output(`${stream.index}_${stream.codec_type}.mkv`)
        demuxCmd.outputOptions([
          `-map 0:${stream.index}`,
          '-c', 'copy',
          '-f', 'matroska'
        ])
        demuxes.push(path.resolve(`${stream.index}_${stream.codec_type}.mkv`))
      })

      demuxCmd.on('start', cmd => console.log('running FFmpeg command', cmd))
      demuxCmd.on('error', err => reject(err))
      demuxCmd.on('end', (err, stdout, stderr) => {
        this.demuxes.push(...demuxes)
        resolve(demuxes)
      })
      demuxCmd.run()
    })
  }
}


module.exports = Source
