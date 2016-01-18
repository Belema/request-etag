'use strict';

var Request = require('../lib/request-etag');

describe('request-etag', function () {
  describe('Constructor', function () {
    it('should return an function with a reset property', function () {
      var request = new Request();

      request.should.be.Function();
      request.should.have.property('reset');
    });

    it('should return distinct instances', function () {
      var request1 = new Request();
      var request2 = new Request();

      request1.should.not.equal(request2);
    });

    it('should return distinct instances with distinct reset properties', function () {
      var request1 = new Request();
      var request2 = new Request();

      request1.reset.should.not.equal(request2.reset);
    });
  });

  describe('instance', function () {
    it('should invoque callback with underlying get returned values, when response statusCode is 200', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200, headers: { etag: '1' } };
      var baseHttpClient = function (options, callback) { callback(null, dummyResponse, dummyBody); };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', function (error, response, body) {
        (error === null).should.be.true();
        response.should.equal(dummyResponse);
        body.should.equal('Body');
        done();
      });
    });

    it('should handle responses without ETag', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200 };
      var baseHttpClient = function (options, callback) { callback(null, dummyResponse, dummyBody); };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', function (error, response, body) {
        (error === null).should.be.true();
        response.should.equal(dummyResponse);
        body.should.equal('Body');
        done();
      });
    });

    it('should not add If-None-Match header when request is not in cache', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200, headers: { etag: '1' } };

      var ifNoneMatchHeader;
      var baseHttpClient = function (options, callback) {
        ifNoneMatchHeader = options.headers['If-None-Match'];
        callback(null, dummyResponse, dummyBody);
      };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', function () {
        (ifNoneMatchHeader === undefined).should.be.true();
        done();
      });
    });

    it('should add If-None-Match header when request is in cache', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

      var ifNoneMatchHeader;
      var baseHttpClient = function (options, callback) {
        ifNoneMatchHeader = options.headers['If-None-Match'];
        callback(null, dummyResponse, dummyBody);
      };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', function () {
        dummyBody = 'New body';
        dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

        request('www.wikipedia.org', function () {
          ifNoneMatchHeader.should.equal('etag1');
          done();
        });
      });
    });

    it('should not add If-None-Match header to second request when first request does not respond with an ETag', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200 };

      var ifNoneMatchHeader;
      var baseHttpClient = function (options, callback) {
        ifNoneMatchHeader = options.headers['If-None-Match'];
        callback(null, dummyResponse, dummyBody);
      };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', function () {
        dummyBody = 'Body';
        dummyResponse = { statusCode: 200, headers: { etag: 'etag' } };

        request('www.wikipedia.org', function () {
          (ifNoneMatchHeader === undefined).should.be.true();
          done();
        });
      });
    });

    it('should invoque callback with body from response, when response statusCode is 200', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200, headers: { etag: '1' } };
      var baseHttpClient = function (options, callback) { callback(null, dummyResponse, dummyBody); };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', function () {
        dummyBody = 'New body';
        dummyResponse = { statusCode: 200, headers: { etag: '2' } };

        request('www.wikipedia.org', function (error, response, body) {
          response.should.equal(dummyResponse);
          body.should.equal('New body');
          done();
        });
      });
    });

    it('should invoque callback with body from cache, when response statusCode is 304', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200, headers: { etag: '1' } };
      var baseHttpClient = function (options, callback) { callback(null, dummyResponse, dummyBody); };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', function () {
        dummyBody = null;
        dummyResponse = { statusCode: 304 };

        request('www.wikipedia.org', function (error, response, body) {
          body.should.equal('Body');
          done();
        });
      });
    });

    it('should not cache requests with cookie headers', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

      var ifNoneMatchHeader;
      var baseHttpClient = function (options, callback) {
        ifNoneMatchHeader = options.headers['If-None-Match'];
        callback(null, dummyResponse, dummyBody);
      };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', { headers: { cookie: 'my-cookie' } }, function () {
        dummyBody = 'New body';
        dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

        request('www.wikipedia.org', { headers: { cookie: 'my-cookie' } }, function () {
          (ifNoneMatchHeader === undefined).should.be.true();
          done();
        });
      });
    });

    it('should cache requests with empty cookie headers', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

      var ifNoneMatchHeader;
      var baseHttpClient = function (options, callback) {
        ifNoneMatchHeader = options.headers['If-None-Match'];
        callback(null, dummyResponse, dummyBody);
      };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', { headers: { cookie: '' } }, function () {
        dummyBody = 'New body';
        dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

        request('www.wikipedia.org', { headers: { cookie: '' } }, function () {
          ifNoneMatchHeader.should.equal('etag1');
          done();
        });
      });
    });
    it('should handle non-get requests', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 201 };
      var baseHttpClient = function (options, callback) { callback(null, dummyResponse, dummyBody); };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', { method: 'post' }, function (error, response, body) {
        (error === null).should.be.true();
        response.should.equal(dummyResponse);
        body.should.equal('Body');
        done();
      });
    });

    it('should not cache non-get requests', function (done) {
      var dummyBody = 'Body';
      var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

      var ifNoneMatchHeader;
      var baseHttpClient = function (options, callback) {
        ifNoneMatchHeader = options.headers && options.headers['If-None-Match'];
        callback(null, dummyResponse, dummyBody);
      };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', { method: 'post' }, function () {
        dummyBody = 'New body';
        dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

        request('www.wikipedia.org', { method: 'post' }, function () {
          (ifNoneMatchHeader === undefined).should.be.true();
          done();
        });
      });
    });

    it('should return a copy of the cache content, when response statusCode is 304', function (done) {
      var originalBody = { dummy: 'body' };
      var dummyBody = originalBody;
      var dummyResponse = { statusCode: 200, headers: { etag: '1' } };
      var baseHttpClient = function (options, callback) { callback(null, dummyResponse, dummyBody); };

      var request = new Request({}, baseHttpClient);

      request('www.wikipedia.org', function () {
        dummyBody.dummy = null;
        dummyResponse = { statusCode: 304 };

        request('www.wikipedia.org', function (error, response, body) {
          body.should.not.equal(originalBody);
          body.should.deepEqual({ dummy: 'body' });
          done();
        });
      });
    });

    describe('reset', function () {
      it('should empty the cache', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

        var ifNoneMatchHeader;
        var baseHttpClient = function (options, callback) {
          ifNoneMatchHeader = options.headers['If-None-Match'];
          callback(null, dummyResponse, dummyBody);
        };

        var request = new Request({}, baseHttpClient);

        request('www.wikipedia.org', function () {
          dummyBody = 'New body';
          dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

          request.reset();

          request('www.wikipedia.org', function () {
            (ifNoneMatchHeader === undefined).should.be.true();
            done();
          });
        });
      });
    });
  });
});
