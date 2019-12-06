const fs = require('fs')

const { Package } = require('./index')

class Target {
  constructor(opts = {}) {
    if (opts.pack) {
      if (!opts.pack instanceof Package) {
        throw new Error('Package is not a valid MediaPackage')
      } else {
        this.package = opts.pack
      }
    }
    if (!opts.target) {
      throw new Error(`No target name specified. ${opts}`)
    }
    else if (opts.target && fs.existsSync(`./targets/${opts.target}.json`)) {
      this.name = opts.target
    } else {
      throw new Error('Not a defined target')
    }
    this.config = JSON.parse(fs.readFileSync(`./targets/${opts.target}.json`))
  }
}

module.exports = Target
