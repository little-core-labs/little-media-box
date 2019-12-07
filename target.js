const fs = require('fs')

const { Package } = require('./index')

class Target {
  constructor(options = {}) {
    if (options.package) {
      if (!(options.package instanceof Package)) {
        throw new Error('Package is not a valid MediaPackage')
      } else {
        this.package = options.package
        this.package.assignTargets(this)
      }
    }
    if (!options.target) {
      throw new Error(`No target name specified. ${options}`)
    }
    else if (options.target && fs.existsSync(`./targets/${options.target}.json`)) {
      this.name = options.target
    } else {
      throw new Error('Not a defined target')
    }
    this.config = JSON.parse(fs.readFileSync(`./targets/${options.target}.json`))
  }
  assessTasks() {
    if (!this.package) {
      console.error('Assign a Package to this Target first')
    }
  }
}

module.exports = Target
