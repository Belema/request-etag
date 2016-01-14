'use strict';

var http = require('http');
var etagValue = '686897696a7c876b7e';
var server = new http.Server();
server.on('request', function (request, response) {
  var etagRequest = request.headers['if-none-match'];
  if (etagRequest === etagValue) {
    response.writeHead(304);
  }
  else {
    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'ETag': etagValue
    });
    response.write(new Buffer(10000000));
  }
  response.end();
});

server.listen(3000);
