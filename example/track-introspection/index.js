const { VideoTrack, AudioTrack, SubtitleTrack } = require('../../track')
const { Source } = require('../../source')
const path = require('path')

const uri = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4'
const source = new Source(uri)
const video = VideoTrack.from(source)
const audio = AudioTrack.from(source)
const subtitle = SubtitleTrack.from(source)

console.log(uri)
video.ready(() => {
  console.log('video');
  console.log(video.properties);
})

audio.ready(() => {
  console.log('audio');
  console.log(audio.properties);
})

subtitle.ready(() => {
  console.log('subtitle');
  console.log(subtitle.properties);
})
