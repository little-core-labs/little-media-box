const { Source } = require('./source')
const { ffmpeg } = require('./ffmpeg')
const path = require('path')

class SignalProcessor extends ffmpeg {
  static get DEFAULT_PRESETS_DIR() {
    return path.resolve(__dirname, 'node_modules/fluent-ffmpeg/lib/presets')
  }

  constructor(source, opts) {
    super(source.uri, opts)
  }

  process(opts) {
    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    this.on('start', () => console.log('starting ffmpeg command'))

    this.on('end', () => {
      this.emit('output-source', new Source(path.resolve(this._currentOutput.target)))
    })

    this.run()
  }
}

module.exports = { SignalProcessor }
