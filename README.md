little-media-package
==========

> A collection of media resources

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

### `const source = new Source(uri[, options])`

Creates and returns a new `Source` object from `uri`.

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
bytestream obtained from the provided `source.uri` at the given index number.

#### `const audioTrack = new Track.Audio(source, index=1)`

Creates and returns a new `Audio` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given index number is not a valid audio bytestream.

#### `const subtitleTrack = new Track.Subtitle(source, index=2)`

Creates and returns a new `Subtitle` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given index number is not a valid subtitle bytestream.

#### `const videoTrack = new Track.Video(source, index=0)`

Creates and returns a new `Video` object, which extends `Track`. Throws an
error if the individual media bytestream obtained from the provided `source.uri`
at the given index number is not a valid video bytestream.

## License

MIT
