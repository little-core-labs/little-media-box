# little-media-box

> Convenient atomicized classes for representing digital multimedia assets
> in distributed Node.js DSP pipelines.

## Installation

```sh
$ npm install little-media-box
```

## Status

> **Development/Testing/Documentation**

> [![Actions Status](https://github.com/little-core-labs/little-media-box/workflows/Node%20CI/badge.svg)](https://github.com/little-core-labs/little-media-box/actions)

## Usage

```js
const { Delivery, Source } = require('little-media-box')

const uri = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4'

const delivery = new Delivery()

delivery.ready(() => {
  delivery.source(uri)
  delivery.probe(console.log)
  //delivery.demux(console.log).on('progress', console.log)
  // {
  //   'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4': // {
  //     streams: [ [Object], [Object], [Object] ],
  //     format: {
  //       filename: 'bbb_sunflower_1080p_60fps_normal.mp4',
  //       nb_streams: 3,
  //       nb_programs: 0,
  //       format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
  //       format_long_name: 'QuickTime / MOV',
  //       start_time: 0,
  //       duration: 634.533333,
  //       size: 'N/A',
  //       bit_rate: 'N/A',
  //       probe_score: 100,
  //       tags: [Object]
  //     },
  //     chapters: []
  //   }
  // }
})
```

See [examples](./example) for additional use-cases.

## API

### `const lmb = require('little-media-box')`

Import `little-media-box`.

### `demuxStream = lmb.createDemuxStream(source, [opts])`

Extracts the media track from the given `source` and returns it as a
`stream.Readable`.

### `delivery = new lmb.Delivery([opts])`

An object, which provides one or more `Source` objects. Extends [nanoresource-pool][pr].

### `lmb.demux(source, [opts], callback)`

Extracts one or more media tracks from the given source, and saves each to its
own individual Matroska container.

### `lmb.mux(sources, [opts], callback)`

The `callback` receives `error` and `output` arguments.

### `{ bin } = lmb.settings`

A settings object containing a `bin` object with the following properties:

```js
{
  x264: X264_BIN_PATH,
  ffmpeg: FFMPEG_BIN_PATH,
  ffprobe: FFPROBE_BIN_PATH,
  mkvmerge: MKVMERGE_BIN_PATH,
}
```

### `settings = new lmb.configure([opts])`

### [`lmb.constants`](./constants.js)

Contains many constants used in various operations.

### `{1: iso6391, 2: iso6392, 2: iso6393} = lmb.iso639`


### `lmb.extensions`

An extended `Array` that contains a set of lexicographically-sorted unique file
extension names. Provides various methods like checking the file type for an
extension.

### [`asset = new lmb.Asset(uri, [opts])`](./asset.js)

Extends [nanoresource][nr].

### `source = new lmb.Source(uri, [opts])`

Extends [nanoresource][nr].

### [`track = new lmb.Track(source, [opts])`][tr]

Extends [nanoresource][nr].

### [`subtitleTrack = new lmb.SubtitleTrack(source, [opts]`](./track/subtitle.js)

Extends [`Track`][tr].

### [`videoTrack = new lmb.VideoTrack(source, [opts])`](./track/video.js)

Extends [`Track`][tr].

### [`audioTrack = new lmb.AudioTrack(source, [opts])`](./track/audio.js)

Extends [`Track`][tr].

### `lmb.TrackError`

Track errors.  Contains the following custom properties:

```js
{
  track,
  code: 'TRACK_ERROR'
}

```

### `lmb.TrackPropertiesError`

`code`: `TRACK_PROPERTIES_ERROR`.

### `lmb.TrackPropertiesMissingFormatError`

`code`: `TRACK_FORMAT_NOT_FOUND`.

### `lmb.TrackPropertiesMissingStreamError`

`code`: `TRACK_STREAM_NOT_FOUND`.

### `lmb.TrackValidationError`

`code`: `TRACK_STREAM_NOT_FOUND`.

### `lmb.ffmpeg = require('fluent-ffmpeg')`

Forward require of [`fluent-ffmpeg`](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).

### `lmb.FFPROBE_BIN_PATH`

Path to `ffprobe` bin.

### `lmb.FFMPEG_BIN_PATH`

Path to `ffmpeg` bin.

### `lmb.MKVMERGE_BIN_PATH`

Path to static binary for `mkvmerge`.

### `lmb.X264_BIN_PATH`

Path to static binary `x264`.



## License

MIT

[nr]: https://github.com/mafintosh/nanoresource
[pr]: https://github.com/little-core-labs/nanoresource-pool
[tr]: ./track/track.js
