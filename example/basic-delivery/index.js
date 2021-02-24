const { Delivery, Source } = require('../../.')

const uri = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

const delivery = new Delivery()

delivery.ready(() => {
  delivery.source(uri)
  delivery.probe(console.log)
  //delivery.demux(console.log).on('progress', console.log)
})
