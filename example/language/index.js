const { SubtitleTrack } = require('../../track')
const { Source } = require('../../source')
const Batch = require('batch')
const path = require('path')

const romanceLanguages = [ 'fre', 'spa', 'por' ]
const source = new Source(path.resolve(__dirname, 'example.mkv'))

console.log('Looking for romance languages...', romanceLanguages)

source.open((err) => {
  const romanceSubs = []
  function onprobe(err, data) {
    const batch = new Batch()
    for (const stream of data.streams) {
      const language = stream.tags.language
      console.log(stream.index,
        stream.tags.language,
        romanceLanguages.includes(stream.tags.language)
      )
      if (romanceLanguages.includes(language)) {
        const track = SubtitleTrack.from(source, stream.index)
        batch.push((next) => track.ready(next))
        romanceSubs.push(track)
      }
    }

    batch.end((err) => {
      console.log('romance subtitles on tracks %s', romanceSubs.map((track) => track.streamIndex))
      //console.log(romanceSubs)
    })
  }

  source.probe(onprobe)
})
