const path = require('path')
const uuid = require('uuid/v4')

/**
 * An array of known image ext
 * @private
 */
const IMAGE_EXTNAMES = [
  '.jpeg',
  '.jpg',
  '.png',
  '.tif',
  '.tiff'
]

/**
 * @private
 */
const METADATA_EXTNAME = [
  '.csv',
  '.txt',
  '.xml'
]

/**
 * @public
 * @class
 */
class Asset {
  constructor(opts) {
    this.id = uuid()
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

  get assetType() {

    if (!this.uri) {
      return null
    }

    const extname = path.extname(this.uri)

    if ([
    ].includes(path.extname(this.uri).toLowerCase())) {
        return 'image'
    } else if ([
    ].includes(path.extname(this.uri).toLowerCase())) {
      return 'metadata'
    }
  }
}

module.exports = Asset
