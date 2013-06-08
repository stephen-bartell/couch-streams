var Stream = require('../index')
var es = require('event-stream')

var stream = Stream('http://localhost:5984/endpoints/_design/list/_view/all')
if (!stream)
  return console.log('no stream')

stream.on('error', function (er) {
  console.log(er)
})
.pipe(stream.parse())
.pipe(es.log())