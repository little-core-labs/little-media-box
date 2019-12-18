const prettyBytes = require('pretty-bytes')
const { Source } = require('../../source')
const prettyTime = require('pretty-ms')
const { demux } = require('../../demux')
const Timecode = require('smpte-timecode')
const Progress = require('progress')
const path = require('path')

const uri = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4'
const source = new Source(uri)

console.log('>  open: %s', uri)
source.open((err) => {
  console.log('>  open: %s %s (ready)',
    prettyBytes(source.byteLength),
    path.basename(source.uri))


  console.log('> probe: %s', path.basename(source.uri))
  source.probe((err, probe) => {
    //console.log(probe);
    for (let i = 0; i < probe.streams.length; ++i) {
      console.log(`> probe: streams[${i}]: %s codec_type=%s bit_rate=%s nb_frames=%s`,
        probe.streams[i].codec_long_name,
        probe.streams[i].codec_type,
        probe.streams[i].bit_rate,
        probe.streams[i].nb_frames,
      )

      if (probe.streams[i].width) {
        console.log(`> probe: streams[${i}]: width=%s height=%s`,
          probe.streams[i].width,
          probe.streams[i].height,
        )
      }

      if (probe.streams[i].pix_fmt) {
        console.log(`> probe: streams[${i}]: pix_fmt=%s`,
          probe.streams[i].pix_fmt,
        )
      }
    }

    console.log('> probe: format: %s', probe.format.format_long_name)
    console.log('> probe: format: %s', probe.format.tags.comment)
    console.log('> probe: format: %s - %s',
      probe.format.tags.title,
      probe.format.tags.artist)

    const progress = new Progress(`> demux: | :timecode | (:frames/:nb_frames frames) [:bar] :percent`, {
      width: 32,
      total: probe.streams[0].nb_frames
    })

    let timecode = null
    const demuxer = demux(source, (err, outputs) => {
      if (err) {
        console.error('error:', err.message)
      } else {
        console.log('> demux: outputs:')
        console.log(outputs
          .map((output) => output.uri.replace(process.cwd(), '.'))
          .join('\n'))
      }
    })

    demuxer.on('progress', (info) => {
      try {
        const dropFrameSupport = [29.97, 59.94]
        const [num, den] = probe.streams[0].r_frame_rate.split('/')

        const t = new Date(1970, 0, 1)
        t.setSeconds(probe.streams[0].duration)

        const fps = Number((num/den).toFixed(3))
        timecode = new Timecode(info.timemark, fps, (num % den !== 0 && dropFrameSupport.includes(fps)))
      } catch (err) {
      }

      progress.update(info.frames / probe.streams[0].nb_frames, {
        timecode: timecode ? String(timecode) : info.timemark,
        frames: info.frames,
        nb_frames: probe.streams[0].nb_frames
      })
    })
  })
})
