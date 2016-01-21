'use strict';
var Request = require('../lib/request-etag');

var request = new Request();
console.time('first');

request('http://localhost:3000', {}, function (err, response) {
  console.timeEnd('first');
  console.log('first request, statusCode', response.statusCode);
  console.time('second');
  request('http://localhost:3000', {}, function (err, response) {
    console.timeEnd('second');
    console.log('second request, statusCode', response.statusCode);
  });
  console.time('third');

  request('http://localhost:3000/aa', {}, function (err, response) {
    console.timeEnd('third');
    console.log('second request, statusCode', response.statusCode);
  });
});
