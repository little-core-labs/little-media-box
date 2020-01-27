const { Source } = require('./source')
const { ffmpeg } = require('./ffmpeg')
const path = require('path')

class SignalProcessor extends ffmpeg {
  static get DEFAULT_PRESETS_DIR() {
    return path.resolve(__dirname, 'node_modules/fluent-ffmpeg/lib/presets')
  }

  constructor(source, opts) {
    super(source.uri, opts)
    this.running = false
  }

  process(opts) {
    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    this.on('end', () => {
      this.running = false
      this.emit('output-source', new Source(path.resolve(this._currentOutput.target)))
    })

    this.run()

    this.running = true
  }
}

module.exports = { SignalProcessor }
