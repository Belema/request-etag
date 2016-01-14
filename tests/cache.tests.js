'use strict';

var Cache = require('../lib/cache');

describe('cache', function () {
  describe('constructor', function () {
    it('should return an object with get/set properties', function () {
      var cache = new Cache();

      cache.should.have.property('get');
      cache.should.have.property('set');
    });
  });
});
