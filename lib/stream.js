
var request = require('request')
var through = require('through')
var errs = require('errs')


module.exports = function changes (uri) {
  var downstream = through()

  process.nextTick(function () {
    try {
      var req = request(uri)
      .on('error', function (er) {
        downstream.emit('error', errs.merge(er, 
          {scope: 'socket'}
        ))
      })
      .on('response', function (res) {
        if (res.statusCode >= 400)
          res.on('data', function (data) {
            downstream.emit('error', errs.create(
              { message: JSON.parse(data)
              , code: res.statusCode
              , scope: 'couch'
              }))
          })
        else
          res.pipe(downstream)
      })

    } catch (er) {
      downstream.emit('error', errs.merge(er,
        {scope: 'request'}
      ))
    }
  })
    

  return downstream
}
