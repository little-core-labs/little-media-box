const { Source } = require('../../source')
const path = require('path')

const romanceLanguages = [ 'fre', 'spa', 'por' ]
const source = new Source(path.resolve(__dirname, 'example.mkv'))

source.probe((err, probe) => {
  const subtitleStreams = []

  for (const stream of probe.streams) {
    if ('subtitle' === stream.codec_type) {
      subtitleStreams.push(stream)
    }
  }

  console.log(subtitleStreams)
})
