little-media-box
==========

> Convenient atomicized classes for representing digital multimedia assets
> in distributed Node.js DSP pipelines.

## Installation

```sh
$ npm install little-media-package
```

## Status

> **Development/Testing/Documentation**

## Usage

> TODO

## API

> WIP

### `const delivery = new Media.Delivery(sources[, options])`

Creates and returns a new `Delivery` object, comprised of the provided
`sources`, and modified with the optionally-specified `options`. This object
should contain every media asset necessary to designate the content delivery
complete.

### `const package = new Media.Package(tracks[, options])`

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

#### `const audioTrack = new Track.Audio(source, index=1)`

Creates and returns a new `Audio` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given `index` number is not a valid audio bytestream.

#### `const subtitleTrack = new Track.Subtitle(source, index=2)`

Creates and returns a new `Subtitle` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given `index` number is not a valid subtitle bytestream.

#### `const videoTrack = new Track.Video(source, index=0)`

Creates and returns a new `Video` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given `index` number is not a valid video bytestream.

## License

MIT
