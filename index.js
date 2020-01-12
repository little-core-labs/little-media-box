const { ffmpeg, FFPROBE_BIN_PATH, FFMPEG_BIN_PATH } = require('./ffmpeg')
const { createDemuxStream, demux } = require('./demux')
const { MKVMERGE_BIN_PATH } = require('./mkvmerge')
const { X264_BIN_PATH } = require('./x264')
const { configure } = require('./configure')
const { Delivery } = require('./delivery')
const extensions = require('./extensions')
const { Source } = require('./source')
const { Target } = require('./target')
const { Asset } = require('./asset')
const constants = require('./constants')
const settings = require('./settings')
const { mux } = require('./mux')
const targets = require('./targets')
const iso639 = require('./iso-639')

const {
  AudioTrack,
  SubtitleTrack,
  Track,
  TrackError,
  TrackPropertiesError,
  TrackPropertiesMissingFormatError,
  TrackPropertiesMissingStreamError,
  TrackValidationError,
  VideoTrack
} = require('./track')

/**
 * Module exports.
 */
module.exports = {
  Asset,
  AudioTrack,
  configure,
  constants,
  createDemuxStream,
  Delivery,
  demux,
  extensions,
  ffmpeg,
  FFPROBE_BIN_PATH,
  FFMPEG_BIN_PATH,
  iso639,
  MKVMERGE_BIN_PATH,
  mux,
  settings,
  Source,
  SubtitleTrack,
  Target,
  targets,
  Track,
  TrackError,
  TrackPropertiesError,
  TrackPropertiesMissingFormatError,
  TrackPropertiesMissingStreamError,
  TrackValidationError,
  VideoTrack,
  X264_BIN_PATH,
}
