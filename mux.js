const nanoprocess = require('nanoprocess')
const { Source } = require('./source')
const settings = require('./settings')
const rimraf = require('rimraf')
const Batch = require('batch')
const once = require('once')
const url = require('url')

/**
 * @public
 * @param {Array<String|Source>} sources
 * @param {Object} opts
 * @param {?(Boolean)} opts.append
 * @param {String} opts.output
 * @param {?(Boolean)} opts.strict
 * @param {Function}
 */
function mux(sources, opts, callback) {
  const batch = new Batch()

  // callback may be called several times, lets ensure it is called
  // only once
  callback = once(callback)

  // ensures all items in `sources` are `Source` instances
  sources = sources.map((source) => Source.from(source))

  // open all sources
  for (const source of sources) {
    batch.push((next) => source.open(next))
  }

  batch.end((err) => {
    if (err) { return callback(err) }
    const args = ['--output', opts.output]

    if (true === opts.append) {
      for (const source of sources) {
        if (source === sources[0]) {
          args.push(source.pathname)
        } else {
          args.push(`+${source.pathname}`)
        }
      }
    } else {
      args.push(...sources.map((source) => source.pathname))
    }

    const mkvmerge = nanoprocess(settings.bin.mkvmerge, args, {
      stdio: 'pipe'
    })

    const stdout = []
    const stderr = []

    rimraf(opts.output, (err) => {
      if (err) { return callback(err) }

      mkvmerge.open((err) => {
        if (err) { return callback(err) }
        mkvmerge.process.once('error', (err) => {
          callback(err)
        })

        mkvmerge.stderr.on('data', (data) => {
          stderr.push(data)
        })

        mkvmerge.stdout.on('data', (data) => {
          stdout.push(data)
        })

        mkvmerge.process.on('close', (code) => {
          if ((code > 0 && opts.strict) ||  code > 1) {
            const message = Buffer.concat(stderr.length ? stderr : stdout)
            return callback(Object.assign(new Error(message), { code }))
          } else {
            const output = Source.from(opts.output, opts)
            output.open((err) => {
              if (err) { return callback(err) }
              callback(null, output)
            })
          }
        })
      })
    })
  })
}

/**
 * @TODO
 * @public
 */
function createMuxStream() {
}

/**
 * Module exports.
 */
module.exports = {
  mux
}
