const path = require('path')
const { Delivery, Package, Source, Track } = require('./index')
const Target = require('./target')
const uuidv4 = require('uuid/v4')

class Asset {
  constructor(options = {}) {
    this.uuid = uuidv4()
    this.associations = []

    const opts = options //copy
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

    if (opts.uri) {
      this.uri = path.resolve(opts.uri)
      this.assetType = this.getLikelyType()
    }

  }
  verifyAssociation(association) {
    return association instanceof Delivery ||
      association instanceof Package ||
      association instanceof Source ||
      association instanceof Target ||
      association instanceof Track
  }
  getLikelyType() {
    if (!this.uri) {
      throw new Error("Must set this Asset's `.options.uri`")
    }

    if ([
      '.jpg', '.png', '.jpeg', '.tif', '.tiff'
    ].includes(path.extname(this.uri).toLowerCase())) {
        return 'image'
    } else if ([
      '.xml', '.csv', '.txt'
    ].includes(path.extname(this.uri).toLowerCase())) {
      return 'metadata'
    }
  }
}

module.exports = Asset
