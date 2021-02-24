const prettyBytes = require('pretty-bytes')
const { Source } = require('../../.')
const path = require('path')

const uri = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const source = new Source(uri)
source.open((err) => {
  console.log('%s %s (ready)',
    prettyBytes(source.byteLength),
    path.basename(source.uri))
  source.probe(console.log)
})
