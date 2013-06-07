var Changes = require('../index').changes
var es = require('event-stream')

var stream = Changes('http://localhost:5984/')
.on('error', function (er) {
  console.log(er)
})
.pipe(es.split())
.pipe(es.parse())
.pipe(es.log())