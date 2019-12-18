/**
 * The `TrackError` class represents a base error class for
 * various errors thrown in the `Track` class and potentially
 * any subclass that extends it.
 * @public
 * @class
 * @extends Error
 */
class TrackError extends Error {

  /**
   * Creates a new `TrackError` or extended class
   * from an existing error or input.
   *
   * This is used for creating a new error from a previously
   * created `TrackError` like:
   *
   *   TrackValidationError.from(new TrackPropertiesError(track))
   *
   * will create a new `TrackValidationError` preserving the message
   * created by `TrackPropertiesError`
   * @static
   * @param {?(TrackError|Track|Mixed)} error
   * @param {...?(Mixed)} args
   * @return {TrackError}
   */
  static from(error, ...args) {
    if (error instanceof TrackError) {
      return new this(error.track, error)
    } else {
      return new this(error, ...args)
    }
  }

  /**
   * `TrackError` class constructor.
   * @param {Track} track
   * @param {?(String|Error)} message
   */
  constructor(track, message) {
    let code = null
    if (message instanceof Error) {
      code = message.code || null
      message = message.message
    }

    super(message)
    this.track = track
    if (code) {
      this.code = code
    } else if (this.constructor.code) {
      this.code = this.constructor.code
    }
  }
}

/**
 * The `TrackValidationError` class represents an error that occurs
 * during the validation of a `Track` instance.
 * @public
 * @class
 * @extends TrackError
 */
class TrackValidationError extends TrackError {

  /**
   * The `TrackValidationError` error code.
   * @accessor
   */
  get code() {
    return 'TRACK_VALIDATION_FAILED'
  }

  /**
   * The `TrackValidationError` error message.
   * @accessor
   */
  get message() {
    return 'Track validation failed.'
  }
}

/**
 * The `TrackPropertiesError` class represents an extended `TrackError`
 * class that represents a base class for various errors thrown in the
 * `TrackProperties` class.
 * @public
 * @class
 * @extends TrackError
 */
class TrackPropertiesError extends TrackError { }

/**
 * The `TrackPropertiesMissingStreamError` class represents an error that
 * occurs when the `properties.stream` property is `null` and **required**
 * in a function. The `TrackProperties` class will not throw this error, but
 * rather a consuming class that likely extends the `Track` class.
 * @public
 * @class
 * @extends TrackPropertiesError
 */
class TrackPropertiesMissingStreamError extends TrackPropertiesError {

  /**
   * The `TrackPropertiesMissingStreamError` error code.
   * @accessor
   */
  get code() {
    return 'TRACK_STREAM_NOT_FOUND'
  }

  /**
   * The `TrackPropertiesMissingStreamError` error message.
   * @accessor
   */
  get message() {
    return 'Stream information missing from track properties.'
  }
}

/**
 * The `TrackPropertiesMissingFormatError` class represents an error that
 * occurs when the `properties.format` property is `null` and **required**
 * in a function. The `TrackProperties` class will not throw this error, but
 * rather a consuming class that likely extends the `Track` class.
 * @public
 * @class
 * @extends TrackPropertiesError
 */
class TrackPropertiesMissingFormatError extends TrackPropertiesError {

  /**
   * The `TrackPropertiesMissingFormatError` error code.
   * @accessor
   */
  get code() {
    return 'TRACK_FORMAT_NOT_FOUND'
  }

  /**
   * The `TrackPropertiesMissingFormatError` error message.
   * @accessor
   */
  get message() {
    return 'Format information missing from track properties.'
  }
}

/**
 * Module exports.
 */
module.exports = {
  TrackError,
  TrackPropertiesError,
  TrackPropertiesMissingFormatError,
  TrackPropertiesMissingStreamError,
  TrackValidationError
}
