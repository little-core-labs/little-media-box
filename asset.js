const path = require('path')
const { Delivery, Package, Source, Track } = require('./index')
const Target = require('./target')

class Asset {
  constructor(options = {}) {
    this.associations = []

    const opts = options //copy
    if (opts.path) {
      this.path = path.resolve(opts.path)
    }

    if (opts.assetType) {
      this.assetType = opts.assetType
    }

    if (opts.association) {
      if (Array.isArray(opts.association) &&
        opts.association.every(a => {
          verifyAssociation(a)
        })
      ) {
        this.associations = opts.association
      }
      else if (this.verifyAssociation(opts.association)) {
        this.associations = [opts.association]
      } else {
        console.error('Could not verify association', opts.association)
      }
    }
  }
  verifyAssociation(association) {
    return association instanceof Delivery ||
      association instanceof Package ||
      association instanceof Source ||
      association instanceof Target ||
      association instanceof Track
  }
}

module.exports = Asset
