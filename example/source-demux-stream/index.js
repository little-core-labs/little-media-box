const { Source, AudioTrack, VideoTrack, createDemuxStream } =  require('../../.')
const path = require('path')
const pump = require('pump')
const fs = require('fs')

const uri = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const source = new Source(uri)
const outputs = []

console.log('>  open: %s', uri)
source.open((err) => {
  if (err) { return onfatal(err) }

  console.log('> probe: %s', path.basename(source.uri))
  source.probe((err, probe) => {
    console.log(probe);
  })

  const tracks = {
    video: VideoTrack.from(source),
    audio: AudioTrack.from(source)
  }

  tracks.video.ready((err) => {
    if (err) { return onfatal(err) }
    const { streamIndex } = tracks.video
    console.log('video stream index=', streamIndex);
    const video = createDemuxStream(source, { streamIndex })
    pump(video, fs.createWriteStream('video.mp4'), (err) => {
      if (err) { return onfatal(err) }
    })
  })

  tracks.audio.ready((err) => {
    if (err) { return onfatal(err) }
    const { streamIndex } = tracks.audio
    console.log('audio stream index=', streamIndex);
    const audio = createDemuxStream(source, { streamIndex })
    pump(audio, fs.createWriteStream('audio.mp4'), (err) => {
      if (err) { return onfatal(err) }
    })
  })

})

function onfatal(err) {
  console.error(err.stack || err)
  process.exit(1)
}
