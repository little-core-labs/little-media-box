const { SubtitleTrack } = require('../../track')
const { Source } = require('../../source')
const Batch = require('batch')
const path = require('path')

const romanceLanguages = [ 'fre', 'spa', 'por' ]
const source = new Source(path.resolve(__dirname, 'example.mkv'))

source.probe((err, probe) => {
  const tracks = []
  const batch = new Batch()

  for (const stream of probe.streams) {
    if ('subtitle' === stream.codec_type) {
      const track = SubtitleTrack.from(source.uri, { streamIndex: stream.index })
      tracks.push(track)
      batch.push((next) => track.ready(next))
    }
  }

  batch.end((err) => {
    if (err) { throw err }
    console.log(tracks.map((track) => track.language));
  })
})
