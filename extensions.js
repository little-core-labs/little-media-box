const binary = new Set(Array.from(require('binary-extensions')).sort())
const audio = new Set(Array.from(require('audio-extensions')).sort())
const image = new Set(Array.from(require('image-extensions')).sort())
const video = new Set(Array.from(require('video-extensions')).sort())
const text = new Set(Array.from(require('text-extensions')).sort())

text.add('ass') // Aegisub Advanced Substation Alpha File
text.add('m3u8') // UTF-8 M3U
text.add('mpd') // MPEG-DASH manifest file
text.add('srt') // SubRip Subtitle File
text.add('vtt') // Web Video Text Tracks File

video.add('264') // Ripped Video Data File
video.add('3gp') // 3GPP Multimedia File
video.add('3gp2') // 3GPP Multimedia File
video.add('3gpp') // 3GPP Media File
video.add('3gpp2') // 3GPP2 Multimedia File

video.add('h264') // H.264 Encoded Video File
video.add('hevc') // High Efficiency Video Coding File

video.add('m1v') // MPEG-1 Video File
video.add('ts') // Video Transport Stream File (also `.mpeg`) - by adding this we overload `.ts` over TypeScript files

/**
 * The `Extensions` class represents an extended `Array` that  contains a
 * set of lexicographically sorted unique file extension names. The class
 * provides various methods like checking the file type for an extension.
 * @public
 * @class
 * @extends Array
 */
class Extensions extends Array {

  /**
   * The known file types that extension names could map to.
   * The order in which they appear in this array is the order
   * in which the extension name to file type resolution occurs.
   * @static
   * @protected
   */
  static get types() {
    return [
      'video',
      'audio',
      'image',
      'binary',
      'text'
    ]
  }

  /**
   * `Extensions` class constructor.
   * @private
   */
  constructor() {
    const all = Extensions.types
      .map((type) => Extensions.prototype[type])
      .reduce((all, extensions) => all.concat(...extensions), [])

    super(...new Set(all))
  }

  /**
   * The known file types that extension names could map to.
   * @accessor
   */
  get types() {
    return Extensions.types
  }

  /**
   * An array of all binary file extension names.
   * @accessor
   */
  get binary() {
    return Array.from(binary)
  }

  /**
   * An array of all image file extension names.
   * @accessor
   */
  get image() {
    return Array.from(image)
  }

  /**
   * An array of all audio file extension names.
   * @accessor
   */
  get audio() {
    return Array.from(audio)
  }

  /**
   * An array of all video file extension names.
   * @accessor
   */
  get video() {
    return Array.from(video)
  }

  /**
   * An array of all text file extension names.
   * @accessor
   */
  get text() {
    return Array.from(text)
  }

  /**
   * Determines the file type of an extension. If the type
   * cannot be resolved, then 'unknown' is returned. The file
   * type resolution precedence can be set by setting the type
   * order in a `precedence` array. The default file type resolution
   * order is the order in which the types appear in `extensions.types`.
   * @param {String} extname
   * @param {?(Array<String>)} precedence
   * @return {String}
   * @throws TypeError
   */
  typeof(extname, precedence) {
    if ('string' !== typeof extname) {
      throw new TypeError('Extension name must be a string.')
    }

    if ('.' === extname[0]) {
      extname = extname.slice(1)
    }

    extname = extname.toLowerCase()

    if (false === Array.isArray(precedence)) {
      precedence = []
    }

    const types = Array.from(Extensions.types)
      .sort((prev, current) => {
        const left = precedence.indexOf(prev)
        const right = precedence.indexOf(current)
        if (-1 !== left && -1 === right) {
          return -1
        } else if (-1 === left && -1 !== right) {
          return 1
        } else if (-1 === left && -1 === right) {
          return 0
        } else if (left === right) {
          return 0
        } else if (left < right) {
          return -1
        } else {
          return 1
        }
      })

    for (const type of types) {
      if (this[type].includes(extname)) {
        return type
      }
    }

    return 'unknown'
  }
}

/**
 * Module exports.
 */
module.exports = Object.assign(new Extensions(), {
  Extensions
})
