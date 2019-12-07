const Media = require('../index')

async function main() {
  console.log('Grabbing media source file...')
  const src = await new Media.Source('http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4')
  // const src = await new Media.Source('test.mp4')

  console.log('Source acquired', src, 'demuxing the source...')

  const demuxedSources = await src.demux()
  console.log('Demuxed the source: ', demuxedSources, 'deriving their tracks...')

  /* Derive tracks from the source */
  const videoTrack = new Media.VideoTrack(src)
  const mainAudioTrack = new Media.AudioTrack(src)
  const secAudioTrack = new Media.AudioTrack(src, 2) // fallback audio at track 3

  console.log('Assigning demux files to the Tracks...')

  videoTrack.assignDemux(0)
  mainAudioTrack.assignDemux(1)
  secAudioTrack.assignDemux(2)

  console.log('Assigned. Creating a Package from the Tracks...')

  /* Create a MediaPackage */
  const pack = new Media.Package([mainAudioTrack, secAudioTrack, videoTrack])

  console.log('Package created', pack)

  return pack
}

// Assign a new source based upon the media file URI provided

main()
