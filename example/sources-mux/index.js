const { Source } = require('../../source')
const { demux } = require('../../demux')
const { mux } = require('../../mux')
const path = require('path')

const uri = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4'
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
