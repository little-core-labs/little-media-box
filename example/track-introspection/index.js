const { VideoTrack, AudioTrack } = require('../../track')
const { Source } = require('../../source')
const path = require('path')

const uri = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4'
const source = new Source(uri)
const video = VideoTrack.from(source)
const audio = AudioTrack.from(source)

console.log(uri)
video.ready(() => {
  console.log('type=', video.type);
  console.log('streamIndex=', video.streamIndex);
  console.log('duration=', video.duration);
  console.log('language=', video.language);
  console.log('tags=', video.tags);
})

audio.ready(() => {
  console.log('type=', audio.type);
  console.log('streamIndex=', audio.streamIndex);
  console.log('duration=', audio.duration);
  console.log('language=', audio.language);
  console.log('tags=', audio.tags);
})
