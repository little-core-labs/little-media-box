const ffmpeg = require('fluent-ffmpeg')
const getUri = require('get-uri')
const path = require('path')
const uuidv4 = require('uuid/v4')

class Source {
  constructor(uri) {
    this.uuid = uuidv4()
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

  async demux(streams = []) {
    return new Promise((resolve, reject) => {
      const demuxes = []
      const inStreams = []

      const streamsIterator = streams.entries()

      for (let s of streams) {
        inStreams.push(this.properties.streams[s])
      }

      if (inStreams.length === 0) {
        inStreams.push(...this.properties.streams)
      }

      const demuxCmd = ffmpeg(this.uri)

      inStreams.forEach(stream => {
        const outFile = `${stream.index}_${stream.codec_type}_${stream.tags.language || ''}.mkv`
        demuxCmd.output(outFile)
        demuxCmd.outputOptions([
          `-map 0:${stream.index}`,
          '-c', 'copy',
          '-f', 'matroska'
        ])
        demuxes.push(path.resolve(outFile))
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
