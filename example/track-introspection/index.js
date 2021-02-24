const { Source, VideoTrack, AudioTrack } = require('../../.')
const path = require('path')

const uri = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
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
