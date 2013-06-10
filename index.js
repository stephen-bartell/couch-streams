
var lib = require('./lib')
var url = require('url')
var parsers = lib.parsers
var querystring = require('querystring')
var request = require('request')
var through = require('through')
var errs = require('errs')
var inherits = require('util').inherits
var jsonstream = require('JSONStream')

module.exports = function CS (uri, opts) {
  var u = url.parse(uri)
  var qs = querystring.parse(u.query)
  var feed = qs.feed || 'normal'

  // figure out what kind of stream this is
  var m
  var type = (m = u.pathname.match(/_changes|_all_docs/))
  ? m[0]
  : (m = u.pathname.match(/(_design)\/.*\/(_view).*/))
    ? 'view'
    : (m = u.pathname.match(/(_design)\/.*\/(_filter).*/))
      ? 'filter'
      : null

  // figure out how to parse it.
  var parser
  if (opts.json)
    if (opts.parser)
      parser = jsonstream.parse(opts.parser)
    else
      parser = ('_changes' == type)
      ? ('continuous' == feed)
        ? parsers.continuous()
        : parsers.longpoll()
      : ('_all_docs' == type || 'view' == type || 'filter' == type)
        ? parsers.all_docs()
        : parsers.other()


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
          (parser) 
          ? res.pipe(parser).pipe(downstream)
          : res.pipe(downstream)
      })

    } catch (er) {
      downstream.emit('error', errs.merge(er,
        {scope: 'request'}
      ))
    }
  })
    

  return downstream
}