'use strict';

var Request = require('../lib/request-etag');

describe('request-etag', function () {
  describe('Constructor', function () {
    it('should return an object with a get property', function () {
      var request = new Request();

      request.should.have.property('get');
    });
  });
});
