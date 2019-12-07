const Media = require('../../index')

/*
 * Identify all of the Romance languages in the example Matroska file, then
 * demux those tracks into individual, informally-named demux files.
 */
async function main() {
  const romanceLanguages = [
    'fre',
    'spa',
    'por'
  ]

  const subtitleTracks = []

  const src = await new Media.Source('./example.mkv')

  src.properties.streams.forEach(stream => {
    if (stream.codec_type == 'subtitle') {
      subtitleTracks.push(new Media.SubtitleTrack(src, stream.index))
    }
  })

  const romanceSubs = subtitleTracks.filter(st => {
    return romanceLanguages.includes(st.properties.tags.language)
  }).map(rs => {
    return rs.properties.index
  })

  const romanceLanguageSubs = await src.demux(romanceSubs)

  console.log('Found & demuxed the following romance language subtitle tracks',
    romanceLanguageSubs)
}

main()
