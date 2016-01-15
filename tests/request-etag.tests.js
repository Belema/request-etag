'use strict';

var Request = require('../lib/request-etag');

describe('request-etag', function () {
  describe('Constructor', function () {
    it('should return an object with a get property', function () {
      var request = new Request();

      request.should.have.property('get');
    });

    it('should return distinct instances', function () {
      var request1 = new Request();
      var request2 = new Request();

      request1.should.not.equal(request2);
    });

    it('should return distinct instances with distinct get methods', function () {
      var request1 = new Request();
      var request2 = new Request();

      request1.get.should.not.equal(request2.get);
    });
  });

  describe('instance', function () {
    describe('get', function () {
      it('should invoque callback with underlying get returned values, when response statusCode is 200', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: '1' } };
        var getStub = function (options, callback) { callback(null, dummyResponse, dummyBody); };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', function (error, response, body) {
          (error === null).should.be.true();
          response.should.equal(dummyResponse);
          body.should.equal('Body');
          done();
        });
      });

      it('should handle responses without ETag', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200 };
        var getStub = function (options, callback) { callback(null, dummyResponse, dummyBody); };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', function (error, response, body) {
          (error === null).should.be.true();
          response.should.equal(dummyResponse);
          body.should.equal('Body');
          done();
        });
      });

      it('should not add If-None-Match header when request is not in cache', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: '1' } };

        var headersIfNoneMatch;
        var getStub = function (options, callback) {
          headersIfNoneMatch = options.headers['If-None-Match'];
          callback(null, dummyResponse, dummyBody);
        };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', function () {
          (headersIfNoneMatch === undefined).should.be.true();
          done();
        });
      });

      it('should add If-None-Match header when request is in cache', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

        var headersIfNoneMatch;
        var getStub = function (options, callback) {
          headersIfNoneMatch = options.headers['If-None-Match'];
          callback(null, dummyResponse, dummyBody);
        };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', function () {
          dummyBody = 'New body';
          dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

          request.get('www.wikipedia.org', function () {
            headersIfNoneMatch.should.equal('etag1');
            done();
          });
        });
      });

      it('should not add If-None-Match header to second request when first request does not respond with an ETag', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200 };

        var headersIfNoneMatch;
        var getStub = function (options, callback) {
          headersIfNoneMatch = options.headers['If-None-Match'];
          callback(null, dummyResponse, dummyBody);
        };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', function () {
          dummyBody = 'Body';
          dummyResponse = { statusCode: 200, headers: { etag: 'etag' } };

          request.get('www.wikipedia.org', function () {
            (headersIfNoneMatch === undefined).should.be.true();
            done();
          });
        });
      });

      it('should invoque callback with body from response, when response statusCode is 200', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: '1' } };
        var getStub = function (options, callback) { callback(null, dummyResponse, dummyBody); };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', function () {
          dummyBody = 'New body';
          dummyResponse = { statusCode: 200, headers: { etag: '2' } };

          request.get('www.wikipedia.org', function (error, response, body) {
            response.should.equal(dummyResponse);
            body.should.equal('New body');
            done();
          });
        });
      });

      it('should invoque callback with body from cache, when response statusCode is 304', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: '1' } };
        var getStub = function (options, callback) { callback(null, dummyResponse, dummyBody); };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', function () {
          dummyBody = null;
          dummyResponse = { statusCode: 304 };

          request.get('www.wikipedia.org', function (error, response, body) {
            body.should.equal('Body');
            done();
          });
        });
      });

      it('should not cache requests with cookie headers', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

        var headersIfNoneMatch;
        var getStub = function (options, callback) {
          headersIfNoneMatch = options.headers['If-None-Match'];
          callback(null, dummyResponse, dummyBody);
        };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', { headers: { cookie: 'my-cookie' } }, function () {
          dummyBody = 'New body';
          dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

          request.get('www.wikipedia.org', { headers: { cookie: 'my-cookie' } }, function () {
            (headersIfNoneMatch === undefined).should.be.true();
            done();
          });
        });
      });

      it('should cache requests with empty cookie headers', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

        var headersIfNoneMatch;
        var getStub = function (options, callback) {
          headersIfNoneMatch = options.headers['If-None-Match'];
          callback(null, dummyResponse, dummyBody);
        };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', { headers: { cookie: '' } }, function () {
          dummyBody = 'New body';
          dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

          request.get('www.wikipedia.org', { headers: { cookie: '' } }, function () {
            headersIfNoneMatch.should.equal('etag1');
            done();
          });
        });
      });
    });

    describe('reset', function () {
      it('should empty the cache', function (done) {
        var dummyBody = 'Body';
        var dummyResponse = { statusCode: 200, headers: { etag: 'etag1' } };

        var headersIfNoneMatch;
        var getStub = function (options, callback) {
          headersIfNoneMatch = options.headers['If-None-Match'];
          callback(null, dummyResponse, dummyBody);
        };

        var request = new Request({}, { get: getStub });

        request.get('www.wikipedia.org', function () {
          dummyBody = 'New body';
          dummyResponse = { statusCode: 200, headers: { etag: 'etag2' } };

          request.reset();

          request.get('www.wikipedia.org', function () {
            (headersIfNoneMatch === undefined).should.be.true();
            done();
          });
        });
      });
    });
  });
});
