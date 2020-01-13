const { Delivery, Source } = require('../../.')

const uri = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4'

const delivery = new Delivery()

delivery.ready(() => {
  delivery.source(uri)
  delivery.probe(console.log)
  //delivery.demux(console.log).on('progress', console.log)
})
