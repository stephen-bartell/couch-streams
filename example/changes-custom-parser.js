var Stream = require('../index')
var es = require('event-stream')

var stream = Stream
  ( 'http://localhost:5984/test/_changes?include_docs=true'
  , { json: true
    , parser: ['results', true, 'doc'] //JSONStream style parsing array/str.
    }
  )
if (!stream)
  return console.log('no stream')

stream.on('error', function (er) {
  console.log(er)
})
.pipe(es.log())