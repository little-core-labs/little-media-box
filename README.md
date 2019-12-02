little-media-box
==========

> Convenient atomicized classes for representing digital multimedia assets
> in distributed Node.js DSP pipelines.

## Installation

> WIP

## Status

> **Development/Testing/Documentation**

## Usage

```js
const Media = require('little-media-box')

async function main() {
  const src = await new Media.Source('http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4')
  // const src = await new Media.Source('test.mp4')

  /* Derive tracks from the source */
  const videoTrack = new Media.Track.Video(src) // video @ track 1/3
  const mainAudioTrack = new Media.Track.Audio(src) // stereo audio @ track 2/3
  const secAudioTrack = new Media.Track.Audio(src, 2) // 5.1 audio @ track 3/3

  /* Create a MediaPackage */
  const pack = new Media.Package([videoTrack, mainAudioTrack, secAudioTrack])
  console.log(pack)
}

main()
```

Produces the following output:

```sh
Package {
  tracks: [
    Video {
      source: [Source],
      properties: [Object],
      mediaType: 'video',
      primary: true,
      valid: true,
      smpteTimecode: [Timecode]
    },
    Audio {
      source: [Source],
      properties: [Object],
      mediaType: 'audio',
      primary: true,
      valid: true
    },
    Audio {
      source: [Source],
      properties: [Object],
      mediaType: 'audio',
      primary: true,
      valid: true
    }],
  opts: {}
}
```

## API

> WIP

### `const delivery = new Delivery(sources[, options])`

Creates and returns a new `Delivery` object, comprised of the provided
`sources`, and modified with the optionally-specified `options`. This object
should contain every media asset necessary to designate the content delivery
complete.

### `const package = new Package(tracks[, options])`

Creates and returns a new `Package` object, comprised of the provided
`tracks`, and modified with the optionally-specified `options`. This object
should contain every media track necessary to ingest, distribute, and view
one complete piece of media content.

### `const source = new Source(uri[, options])`

Creates and returns a new `Source` object from `uri`. `uri` may be one local
file path, or an accessible HTTP/HTTPS location, in which case the file at that
location will be pulled down and read into a `ReadableStream` for consumption
by `ffprobe`.

#### `source.properties`

A read-only accessor for the media properties and metadata obtained from
`ffprobe`.

##### `source.properties.streams`

A read-only accessor for array of individual media bytestreams contained in the
file accessed from `source.uri`.

##### `source.properties.format`

A read-only accessor for the container-level metadata in the file accessed from
`source.uri`.

### `const track = new Track(source, index = 0)`

Creates and returns a new `Track` object, which represents the individual media
bytestream obtained from the provided `source.uri` at the given `index` number.

#### `const audioTrack = new AudioTrack(source, index=1)`

Creates and returns a new `AudioTrack` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given `index` number is not a valid audio bytestream.

#### `const subtitleTrack = new SubtitleTrack(source, index=2)`

Creates and returns a new `SubtitleTrack` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given `index` number is not a valid subtitle bytestream.

#### `const videoTrack = new VideoTrack(source, index=0)`

Creates and returns a new `VideoTrack` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given `index` number is not a valid video bytestream.

## License

MIT
