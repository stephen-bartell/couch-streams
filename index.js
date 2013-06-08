
var lib = require('./lib')
var url = require('url')
var parsers = lib.parsers
var querystring = require('querystring')

module.exports = function (uri, opts) {
  var u = url.parse(uri)
  this.host = u.hostname
  this.port = u.port
  this.auth = u.auth
  this.protocol = u.protocol
  this.path = u.pathname

  // figure out what kind of stream this is
  var m
  this.type = (m = this.path.match(/_changes|_all_docs/))
  ? m[0]
  : (m = this.path.match(/(_design)\/.*\/(_view).*/))
    ? 'view'
    : (m = this.path.match(/(_design)\/.*\/(_filter).*/))
      ? 'filter'
      : null

  var qs = this.qs = querystring.parse(u.query)
  this.feed = qs.feed || 'normal'
  this.since = qs.since || 0

  // figure out how to parse this thing.
  if (!opts)
    opts = {json: true, parser: undefined}
  this.parser = 
  (opts.json)
  ? ('_changes' == this.type)
    ? ('continuous' == this.feed)
      ? parsers.continuous
      : parsers.longpoll
    : null
  :null

  this.parser =
  ('_all_docs' == this.type || 'view' == this.type || 'filter' == this.type)
    ? parsers.all_docs
    : parsers.other

  var downstream = lib.stream(uri)
  downstream.parse = this.parser
  return downstream
}

