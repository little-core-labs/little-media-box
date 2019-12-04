const Target = require('./target')

/**
 * A Presentation is the entire collection of assets required to display a
 * **single** piece of content in its entirety to a viewer.
 */

class Presentation {
  constructor(targets, opts, metadata = {}) {
    if (Array.isArray(targets) && targets.every(t => t instanceof Target)) {
      this.targets = targets
    } else if (targets instanceof Target) {
      this.targets = [targets]
    } else {
      throw new Error('Invalid Targets provided')
    }
  }
}

module.exports = Presentation
