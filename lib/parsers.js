
var jsonstream = require('JSONStream')

module.exports = function parse () {
  
}

module.exports.continuous =
function continuous (filter) {
  var parser =
  filter
  ? jsonstream.parse(filter)
  : jsonstream.parse()
  return parser
}

module.exports.longpoll =
function longpoll (filter) {
  var parser =
  filter
  ? jsonstream.parse(filter)
  : jsonstream.parse(['results', true])

  return parser
}

module.exports.other = 
function other (filter) {
  return jsonstream.parse(filter)
}

module.exports.all_docs =
function all_docs(filter) {
  var parser =
  filter
  ? jsonstream.parse(filter)
  : jsonstream.parse(['rows', true])

  return parser
}