const Media = require('../index')

async function main() {
  const src = await new Media.Source('http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4')
  // const src = await new Media.Source('test.mp4')

  /* Derive tracks from the source */
  const videoTrack = new Media.VideoTrack(src)
  const mainAudioTrack = new Media.AudioTrack(src)
  const secAudioTrack = new Media.AudioTrack(src, 2) // fallback audio at track 3

  /* Create a MediaPackage */
  const pack = new Media.Package([mainAudioTrack, secAudioTrack, videoTrack])
  console.log(pack)
  // console.log(JSON.stringify(pack, null, 2))
  return pack
}

// Assign a new source based upon the media file URI provided

main()
