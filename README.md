request-etag [![Build Status](https://travis-ci.org/Belema/request-etag.svg?branch=master)](https://travis-ci.org/Belema/request-etag)
===========

Small, in-memory, ETag-based, HTTP-response-caching module. It is based on the two following popular NPM packages,

- [request](https://www.npmjs.com/package/request): a simplified HTTP request client.
- [lru-cache](https://www.npmjs.com/package/lru-cache): a cache object that deletes the least-recently-used items.

Request-etag currently only supports GET requests.


Usage
-----
Configuration, 

	var cacheConfig = {
		max: 10 * 1024 * 1024,
		lenght: function (v, k) { return v.length. k.length; }
	};

More details can be found on the cache configuration options on the lru-cache [npm webpage](https://www.npmjs.com/package/lru-cache).

	var ETagRequest = require('request-etag');
	var eTagRequest = new ETagRequest(cacheConfig);

The first call GET request will be sent without `If-None-Match` header. The response will contain a body.

	eTagRequest.get('www.immutablepage.com', function (error, response, body) {
		if (!error && response.statusCode === 200) {
			console.log('Received 200 - body retrieved from response.');
			console.log(body);
		}
		if (!error && response.statusCode === 304) {
			console.log('Received 304 - body retrieved from cache.') 
			console.log(body);
		}
	});

Subsequent GET requests to the same URL will be sent with an `If-None-Match` header. The response code will be 304, and will not contain a response body, but the body will be restored from the cache.


Why is my request not cached?
----------------------------
Situations where the request response is not cached include,

- The response has no entity tag in the header,
- the request is sent with a cookie header,
- the response body is bigger than the cache.


Contributing
-------------
Please run the following commands before submitting a pull-request,

	npm run lint
	npm run code-style
	npm run test
