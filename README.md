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
const { Delivery, Source } = require('little-media-box)

const uri = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4'

const delivery = new Delivery()

delivery.ready(() => {
  delivery.source(uri)
  delivery.probe(console.log)
  //delivery.demux(console.log).on('progress', console.log)
})
```

## API

### `const { Asset, AudioTrack, configure, constants, createDemuxStream, Delivery, demux, extensions, ffmpeg, FFPROBE_BIN_PATH, FFMPEG_BIN_PATH, iso639, MKVMERGE_BIN_PATH, mux, settings, Source, SubtitleTrack, Target, targets, Track, TrackError, TrackPropertiesError, TrackPropertiesMissingFormatError, TrackPropertiesMissingStreamError, TrackValidationError, VideoTrack, X264_BIN_PATH } = require('little-media-box')`

Import the various peices of `little-media-box`.

### `asset = new Asset(uri, [opts])`

### `audioTrack = new AudioTrack(source, [opts])`

### `settings = new configure([opts])`

### `settings = new configure([opts])`

### `constants`

Contains many constants used in various operations. See `./constants.js`.

### `demuxStream = createDemuxStream(source, [opts])`

### `delivery = Delivery([opts])`

### `demuxer = demux(source, [opts], callback)`

### `extensions`

???

### `ffmpeg = require('fluent-ffmpeg')`

Forward require of [`fluent-ffmpeg`](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).

### `FFPROBE_BIN_PATH = require('ffprobe-static').path`

Path to `ffprobe` bin. Forward require of [`ffprobe-static`](https://github.com/joshwnj/ffprobe-static).path.

### `FFMPEG_BIN_PATH = require('ffmpeg-static').path`

Path to `ffmpeg` bin. Forward require of [`ffmpeg-static`](https://github.com/eugeneware/ffmpeg-static).path.

### `iso639`
### `MKVMERGE_BIN_PATH`
### `mux`
### `settings`
### `Source`
### `SubtitleTrack`
### `Target`
### `targets`
### `Track`
### `TrackError`
### `TrackPropertiesError`
### `TrackPropertiesMissingFormatError`
### `TrackPropertiesMissingStreamError`
### `TrackValidationError`
### `VideoTrack`
### `X264_BIN_PATH`

## License

MIT
