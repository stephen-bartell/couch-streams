var Stream = require('../index')
var es = require('event-stream')

var stream = Stream
  ( 'http://localhost:5984/test/_changes?filter=filters/all'
  , { json: true
    }
  )
if (!stream)
  return console.log('no stream')

stream.on('error', function (er) {
  console.log(er)
})
.pipe(es.log())