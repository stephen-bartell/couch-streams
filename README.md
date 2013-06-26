# couch-streams

A stream interface to CouchDB which provides application level error handling and json parsing.

### Error Handling   

Instead of doing this:  

``` js
var request = require('request')

try {
  var req = request('http://localhost:5984/wtf') // where the wtf database doesnt exist
} catch (er) {
  return handleRequestError(er)
}

req.on('error', function (er) {
  handleSocketError(er)
})

req.on('response', function(res) {
  if (res.statusCode >= 400)
    return handleCouchdbError(er)

  andleResponse(res)
})
```


You could do this:

``` js
var request = require('couch-stream')

var req = request('http://localhost:5984/wtf')
.on('error', function (er) {
  handleError(er) // with er.scope being either "request", "socket", or "couchdb"
})
.pipe(handleData)
```

### JSON parsing

In addition to error handling, you get real-time JSON parsing for free (note that you can opt out of JSON parsing). For example, you have a database named "db" which contains a good amount of docs (good amount meaning thousands). You query `_changes` on the database.  Now, instead of waiting to recieve the entire JSON response from Couch in order to begin parsing, `couch-streams` will use dominictarrs [JSONStream](https://github.com/dominictarr/JSONStream) module to parse the data as it comes in, in real time.  `couch-streams` will examine the url to figure out how best to parse it too.

curling the "db" database will give you:

``` bash
∴ couch-streams master!∶ curl http://localhost:5984/db/_changes
{"results":[
{"seq":1,"id":"1","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]},
{"seq":2,"id":"2","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]},
{"seq":3,"id":"3","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]}
],
"last_seq":3}
```

Using `couch-streams` with JSON parsing will give you:

``` js
var request = require('couch-stream')
var through = require('through')

var req = request('http://localhost:5984/db')
.pipe(through(function (doc) {
  /*
  doc will be JSON:
  {"seq":1,"id":"1","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]}
  {"seq":2,"id":"2","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]}
  {"seq":3,"id":"3","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]}
  */
}))
```

## methods

``` js
var request = require('couch-streams')
```

### var stream = request(url, opts)

create a `stream` from a fully qualified `url` and `opts`

* __opts.json__ _default: true_ stream data as json objects
* __opts.parser__ _default: undefined_ a json path which gets passed into JSONStream.parse(), [JSONStream docs](https://github.com/dominictarr/JSONStream#jsonstreamparsepath)

## events

### stream.on('error', function (er) {})

* __er.scope__ the scope of where the error ocuured.
   1. __request__ : `request` through an exception when attempting to create connection
   2. __socket__: an error was emitted when attempting to create a connection.  Something like the wrong port number.
   3. __couch__: CouchDB level error such as "database not found" or "unauthorized"

## todo

This module current implements only GET's. I eventually want to do PUT's, POST's, and DELETE's.  


#### posts

#### bulk

using a stream.post api:
``` js

var request = require('couch-streams')
var dataSource = [
  {"seq":1,"id":"1","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]},
  {"seq":2,"id":"2","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]},
  {"seq":3,"id":"3","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]}
]

var req = request('http://localhost:5984/db/_bulk_docs')
req.post(dataSouce)
.on('error', handleError)
.pipe(handleResponss)

```

or piping into the stream:
``` js
var request = require('couch-streams')
var through = require('through')
var dataSource = [
  {"seq":1,"id":"1","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]},
  {"seq":2,"id":"2","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]},
  {"seq":3,"id":"3","changes":[{"rev":"1-967a00dff5e02add41819138abb3284d"}]}
]

through(function () {
  emit('data', dataSource)
})
.pipe(request('http://localhost:5984/db/_bulk_docs'))
.on('error', handleError)
.pipe(handleResponse)
```




