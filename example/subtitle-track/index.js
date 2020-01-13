const { SubtitleTrack } = require('../../.')
const path = require('path')

const uri = path.resolve(__dirname, 'subtitles.srt')
const subtitle = SubtitleTrack.from(uri)

console.log('probing:', uri)
subtitle.ready((err) => {
  if (err) { throw err }
  console.log('type=', subtitle.type);
  console.log('name=', subtitle.properties.stream.codec_long_name)
  console.log('streamIndex=', subtitle.streamIndex);
  console.log('duration=', subtitle.duration);
  console.log('language=', subtitle.language);
  console.log('tags=', subtitle.tags);
})
