const prettyBytes = require('pretty-bytes')
const { Source } = require('../../.')
const path = require('path')

const uri = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4'
const source = new Source(uri)
source.open((err) => {
  console.log('%s %s (ready)',
    prettyBytes(source.byteLength),
    path.basename(source.uri))
  source.probe(console.log)
})
