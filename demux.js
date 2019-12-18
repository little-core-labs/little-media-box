const { Source } = require('./source')
const { ffmpeg } = require('./ffmpeg')
const { Track } = require('./track')
const assert = require('assert')
const Batch = require('batch')
const debug = require('debug')('little-media-box:demux')
const once = require('once')
const path = require('path')

/**
 * @public
 * @param {Source|Track|String|Object} source
 * @param {?(Object)} opts
 * @param {Function<Error, Array<Source>>} callback
 */
function demux(source, opts, callback) {
  // coerce into `Source` instance and get own copy
  source = Source.from(source)

  if ('function' === typeof opts) {
    callback = opts
  }

  if (!opts || 'object' !== opts) {
    opts = {}
  }

  assert('function' === typeof callback, 'Expecting callback to be a function.')

  const batch = new Batch()
  const inputs = []
  const outputs = new Set()
  const pending = []
  const streams = Array.isArray(opts.streams) ? opts.streams : []

  const stream = source.createReadStream()
  const demuxer = ffmpeg(stream)

  source.ready(onready)

  return demuxer

  function onready(err) {
    if (err) { return callback(err) }
    source.active()
    source.probe(onprobe)
  }

  function onprobe(err, info) {
    if (err) { return callback(err) }

      if (streams.length > 0) {
        for (const index of streams) {
          inputs.push(info.streams[index])
        }
      } else {
        inputs.push(...info.streams)
      }

    const { cwd = source.cwd } = opts
    const { demuxOptions } = source

    for (const input of inputs) {
      const { index, codec_type, tags } = input
      const outputOptions = demuxOptions.concat([`-map 0:${index}`])
      const language = tags.language || ''
      const extname = opts.extname || '.mkv'
      const output = `${index}_${codec_type}_${language}${extname}`

      debug('demux(): output:', output)
      debug('demux(): options:', demuxOptions)

      demuxer.output(output)
      demuxer.outputOptions(outputOptions)

      outputs.add(Source.from(path.resolve(cwd, output), opts))
    }

    demuxer.on('error', onerror)
    demuxer.on('end', onend)

    process.nextTick(() => demuxer.run())
  }

  function onerror(err) {
    source.inactive()
    callback(err)
  }

  function onend(err, stdout, stderr) {
    debug('demux(): ffmpeg:', stdout)
    debug('demux(): ffmpeg:', stderr)

    if (err) {
      return callback(err)
    }

    source.inactive()

    for (const output of outputs) {
      batch.push((next) => output.ready(next))
    }

    batch.end((err) => {
      if (err) { return callback(err) }
      callback(null, Array.from(outputs))
    })
  }
}

/**
 * Module exports.
 */
module.exports = {
  demux
}
