class Target {
  constructor(opts = {}) {
    if (!opts.target) {
      throw new Error(`No target name specified. ${opts}`)
    }
    else if (opts.target && fs.existsSync(`./targets/${opts.target}.json`)) {
      this.name = opts.target
    } else {
      throw new Error('Not a defined target')
    }

    return this
  }
}

module.exports = Target
