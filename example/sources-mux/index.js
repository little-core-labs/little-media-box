const { mux, demux, Source } = require('../../.')
const path = require('path')

const uri = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const filename = 'video.mkv'
const subtitles = path.resolve(__dirname, 'subtitles.srt')

console.log('> demuxing:', uri)
demux(uri, (err, sources) => {
  if (err) { throw err }
  console.log('>   muxing:', sources.map(o => o.pathname))
  console.log('>   muxing:', subtitles)
  sources.push(subtitles)
  mux(sources, { output: filename }, (err, output) => {
    if (err) { throw err }
    console.log('>   output:', output.pathname);
  })
})
