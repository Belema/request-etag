request-etag [![Build Status](https://travis-ci.org/Belema/request-etag.svg?branch=master)](https://travis-ci.org/Belema/request-etag)
===========

Small, in-memory, ETag-based, HTTP-response-caching module. It is based on the two following popular NPM packages,

- [lru-cache](https://www.npmjs.com/package/lru-cache): a cache object that deletes the least-recently-used items.
- [request](https://www.npmjs.com/package/request): a simplified HTTP request client. This is used by default, but can be overridden in the `request-etag` constructor.


Usage
-----
Configuration,

	var cacheConfig = {
		max: 10 * 1024 * 1024
	};

A default `length` function is injected into the cache object by `request-etag`. It returns the sum of the length of the key, and the length of the value as JSON.
More details on the cache configuration options can be found on the lru-cache [webpage](https://www.npmjs.com/package/lru-cache).

	var ETagRequest = require('request-etag');
	var eTagRequest = new ETagRequest(cacheConfig);

The `ETagRequest` constructor takes a second optional argument which specifies the underlying HTTP request client to use. It defaults to [request](https://www.npmjs.com/package/request), so the above constructor call is equivalent to,

	var eTagRequest = new ETagRequest(cacheConfig, require('request'));

**Note that the signature of the underlying HTTP request client function MUST be the same as that of [request](https://www.npmjs.com/package/request) (e.g. [requestretry](https://www.npmjs.com/package/requestretry)).**

The first GET request will be sent without an `If-None-Match` header, and its response will contain a body.

	eTagRequest('www.immutablepage.com', function (error, response, body) {
		if (!error && response.statusCode === 200) {
			console.log('Received 200 - body retrieved from response.');
			console.log(body);
		}
		if (!error && response.statusCode === 304) {
			console.log('Received 304 - body retrieved from cache.')
			console.log(body);
		}
	});

Subsequent GET requests to the same URL will be sent with an `If-None-Match` header. The response code will be 304, and the response will not contain a body. However a body will be passed by the cache to the `body` parameter of the callback function.


Why is my request not cached?
----------------------------
Situations where the request response is not cached include,

- the request is not a GET request,
- The response has no entity tag in the header,
- the request is sent with a non-empty cookie header,
- the response body is bigger than the cache.


Contributing
-------------
Please run the following commands before submitting a pull-request,

	npm run lint
	npm run code-style
	npm run test
