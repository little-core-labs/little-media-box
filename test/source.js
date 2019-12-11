const assert = require('assert')

const { Source } = require('../index')

describe('Source', () => {
  it('should create a new Source with properties populated', async() => {
    const src = await new Source('./test/subtitles.mkv')
    assert(src instanceof Source)
  })
})
