const { TrackProperties } = require('./properties')
const { SubtitleTrack } = require('./subtitle')
const { AudioTrack } = require('./audio')
const { VideoTrack } = require('./video')
const { Track } = require('./track')

const {
  TrackError,
  TrackPropertiesError,
  TrackPropertiesMissingFormatError,
  TrackPropertiesMissingStreamError,
  TrackValidationError
} = require('./error')

/**
 * Module exports.
 */
module.exports = {
  AudioTrack,
  SubtitleTrack,
  Track,
  TrackError,
  TrackPropertiesError,
  TrackPropertiesMissingFormatError,
  TrackPropertiesMissingStreamError,
  TrackValidationError,
  VideoTrack
}
