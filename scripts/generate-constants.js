const { format } = require('util')
const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs')

const output = path.resolve(__dirname, '..', 'constants.js')

fs.readFile(path.resolve(__dirname, 'fixtures', 'formats'), onread)

function onread(err, buffer) {
  const lines = String(buffer).split('\n').filter(Boolean)
  const muxers = []
  const exported = []
  const demuxers = []
  for (const line of lines) {
    const regex = /([D|E]+)\s+([a-z|0-9|_|.|-|,]+)\s+(.*)$/
    const parts = line.trim().match(regex)
    if (!parts) { continue }
    const [ , pattern,  name, description ] = parts
    const support = pattern.split('')
    if (support.includes('D')) {
      demuxers.push([name, description])
    }

    if (support.includes('E')) {
      muxers.push([name, description])
    }
  }

  rimraf(output, (err) => {
    const stream = fs.createWriteStream(output)
    stream.write(format('// Generated on %s', Date()))
    stream.write('\n')
    stream.write('\n')

    for (const muxer of muxers) {
      exported.push(define(stream, muxer[0], 'mux', muxer[0], muxer[1]))
    }

    for (const demuxer of demuxers) {
      exported.push(define(stream, demuxer[0], 'demux', demuxer[0], demuxer[1]))
    }

    stream.write(`
/**
 * Module exports.
 */
module.exports = {
  ${exported.join(',\n  ')}
}`)

    stream.end()
    console.log('Generated %s', output)
  })
}

function define(stream, name, category, value, comment) {
  category = category.toUpperCase()
  name = name.toUpperCase()
  name = name.replace(/,/g, '_')
  name = name.replace(/-/g, '_')
  name = name.replace(/\./g, '_')
  const variable = format('%s_%s_FORMAT', category, name)
  stream.write(format('const %s = \'%s\' // %s', variable, value, comment))
  stream.write('\n')
  return variable
}
