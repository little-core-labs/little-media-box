const Source = require('./source')

/**
 * A Presentation is the entire collection of assets required to display a
 * **single** piece of content in its entirety to a viewer.
 */

class Presentation {
  constructor(sources, opts, metadata = {}) {
    if (Array.isArray(sources) && sources.every(s => s instanceof Source)) {
      this.sources = sources
    } else if (sources instanceof Source) {
      this.sources = [sources]
    }
  }
}

module.exports = Presentation
