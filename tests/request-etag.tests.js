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
    it('should invoque callback with same arguments as underlying get returned values, when response statusCode is 200', function (done) {
      var getBody = 'Body';
      var getResponse = { statusCode: 200, headers: { etag: '1' } };
      var getStub = function (options, callback) { callback(null, getResponse, getBody); };

      var request = new Request({}, { get: getStub });

      request.get('www.wikipedia.org', function (error, response, body) {
        (error === null).should.be.true();
        response.should.equal(getResponse);
        body.should.equal('Body');
        done();
      });
    });

    it('should invoque callback with body from response, when response statusCode is 200', function (done) {
      var getBody = 'Body';
      var getResponse = { statusCode: 200, headers: { etag: '1' } };
      var getStub = function (options, callback) { callback(null, getResponse, getBody); };

      var request = new Request({}, { get: getStub });

      request.get('www.wikipedia.org', function () {
        getBody = 'New body';
        getResponse = { statusCode: 200, headers: { etag: '2' } };

        request.get('www.wikipedia.org', function (error, response, body) {
          response.should.equal(getResponse);
          body.should.equal('New body');
          done();
        });
      });
    });

    it('should invoque callback with body from cache, when response statusCode is 304', function (done) {
      var getBody = 'Body';
      var getResponse = { statusCode: 200, headers: { etag: '1' } };
      var getStub = function (options, callback) { callback(null, getResponse, getBody); };

      var request = new Request({}, { get: getStub });

      request.get('www.wikipedia.org', function () {
        getBody = null;
        getResponse = { statusCode: 304 };

        request.get('www.wikipedia.org', function (error, response, body) {
          body.should.equal('Body');
          done();
        });
      });
    });
  });
});
