const { Source } = require('./source')
const { ffmpeg } = require('./ffmpeg')
const { Track } = require('./track')
const through = require('through2')
const assert = require('assert')
const Batch = require('batch')
const debug = require('debug')('little-media-box:demux')
const once = require('once')
const path = require('path')

/**
 * The default file extension name used for demux outputs
 * @public
 * @const
 */
const DEFAULT_DEMUX_FILE_EXTENSION_NAME = '.mkv'

/**
 * Creates and returns an array of output options
 * for the source demuxer.
 * @private
 * @param {?(Array)} extras
 * @return {Array}
 */
function createDemuxOutputOptions(extras) {
  const options = ['-c', 'copy', '-f', 'matroska']
  return Array.from(new Set(options.concat(extras || [])))
}

/**
 * Demux source streams into own outputs. This function writes demuxed streams
 * to the file system and provides them as `Source` instances to the caller in
 * the `calllback()` function upon success.
 * @public
 * @param {Source|Track|String|Object} source
 * @param {?(Object)} opts
 * @param {?(String)} opts.cwd
 * @param {?(String)} opts.extname
 * @param {?(Number)} opts.streamIndex
 * @param {?(Array)} opts.demuxOptions
 * @param {?(Array<Number>)} opts.streamIndices
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
  const streamIndices = Array.isArray(opts.streamIndices)
    ? opts.streamIndices
    : []

  const stream = source.createReadStream()
  const demuxer = ffmpeg(stream)
  const demuxOptions = createDemuxOutputOptions(opts.demuxOptions)

  if (0 === streamIndices.length && 'number' === typeof opts.streamIndex) {
    streamIndices.push(opts.streamIndex)
  }

  source.ready(onready)

  return demuxer

  function onready(err) {
    if (err) { return callback(err) }
    source.active()
    source.probe(onprobe)
  }

  function onprobe(err, info) {
    if (err) { return callback(err) }

      if (streamIndices.length > 0) {
        for (const index of streamIndices) {
          inputs.push(info.streams[index])
        }
      } else {
        inputs.push(...info.streams)
      }

    const { cwd = source.cwd } = opts

    for (const input of inputs) {
      const { index, codec_type, tags } = input
      const outputOptions = demuxOptions.concat([`-map 0:${index}`])
      const language = tags && tags.language || ''
      const extname = opts.extname || DEFAULT_DEMUX_FILE_EXTENSION_NAME
      const output = `${index}_${codec_type}_${language}${extname}`

      debug('demux(): output:', output)
      debug('demux(): options:', outputOptions)

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
 * Creates a demux stream from a source. The stream can be
 * selected by specifying the stream index with `opts.streamIndex`.
 * The default stream index is `0` if it is not given.
 * @public
 * @param {Source|Track|String|Object} source
 * @param {?(Object)} opts
 * @param {?(String)} opts.cwd
 * @param {?(Number)} opts.streamIndex
 * @param {?(Array)} opts.demuxOptions
 * @return {Stream}
 */
function createDemuxStream(source, opts) {
  if (!opts || 'object' !== typeof opts) {
    opts = {}
  }

  // coerce into `Source` instance and get own copy
  source = Source.from(source)

  const { streamIndex = 0 } = opts
  const sourceStream = source.createReadStream()
  const demuxStream = through()
  const demuxer = ffmpeg(sourceStream)

  const demuxOptions = createDemuxOutputOptions(opts.demuxOptions)
  const outputOptions = demuxOptions.concat([`-map 0:${streamIndex}`])

  source.ready(onready)

  demuxer.outputOptions(outputOptions)
  demuxer.output(demuxStream)
  demuxer.on('error', onerror)
  demuxer.on('end', onend)

  debug('createDemuxStream(): output options:', outputOptions)

  return Object.assign(demuxStream, { demuxer })

  function onready(err) {
    if (err) { return demuxStream.emit('error', err) }

    source.active()
    demuxer.run()
  }

  function onerror(err) {
    source.inactive()
    demuxStream.emit('error', err)
  }

  function onend(err, stdout, stderr) {
    debug('demux(): ffmpeg:', stdout)
    debug('demux(): ffmpeg:', stderr)

    if (err) {
      return onerror(err)
    }

    source.inactive()
  }
}

/**
 * Module exports.
 */
module.exports = {
  DEFAULT_DEMUX_FILE_EXTENSION_NAME,

  createDemuxStream,
  demux
}
