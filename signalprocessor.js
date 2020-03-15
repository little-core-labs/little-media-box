const { Source } = require('./source')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

class SignalProcessor {
  constructor(config) {
    this.config = config
  }

  _configure(ffmpeg, opts, callback) {
    process.nextTick(callback, null)
  }

  process(source, opts, callback) {
    if ('function' === typeof opts) {
      callback = opts
      opts = {}
    }

    source = Source.from(source)
    opts = Object.assign({}, this.config, opts)

    const processor = ffmpeg(source.uri, opts)

    this._configure(ffmpeg, opts, onconfigure)

    process.once('end', onend)

    return processor

    function onerror(err) {
      callback(err)
    }

    function onconfigure(err) {
      if (err) { return onerror(err) }
      processor.run()
    }

    function onend() {
      const output = Source.from(path.resolve(processor._currentOutput.target))
      output.ready((err) => {
        callback(err, output)
      })
    }
  }
}

module.exports = { SignalProcessor }
