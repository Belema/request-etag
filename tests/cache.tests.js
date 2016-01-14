'use strict';

var Cache = require('../lib/cache');

describe('cache', function () {
  describe('constructor', function () {
    it('should return an object with get/set properties', function () {
      var cache = new Cache();

      cache.should.have.property('get');
      cache.should.have.property('set');
    });

    it('should return distinct instances', function () {
      var cache1 = new Cache();
      var cache2 = new Cache();

      cache1.set('key', 'value1');
      cache2.set('key', 'value2');

      cache1.get('key').should.equal('value1');
      cache2.get('key').should.equal('value2');
    });
  });

  describe('instance', function () {
    it('should returned undefined for keys not found in the cache', function () {
      var cache = new Cache();

      (typeof cache.get('key')).should.equal('undefined');
    });

    it('should accept string as key', function () {
      var cache = new Cache();

      cache.set('key', 'value');

      cache.get('key').should.equal('value');
    });

    it('should return instance stored', function () {
      var cache = new Cache();
      var value = { id: 1, value: 'text' };

      cache.set('key', value);

      cache.get('key').should.equal(value);
      cache.get('key').should.not.equal({ id: 1, value: 'text' });
    });

    it('should accept objects as key', function () {
      var cache = new Cache();

      cache.set({ id: 1, title: 'key' }, 'object value');

      cache.get({ id: 1, title: 'key' }).should.equal('object value');
    });

    it('should store multiple pairs (object, value)', function () {
      var cache = new Cache();

      cache.set({ id: 1, title: 'first key' }, 'first object value!');
      cache.set({ id: 2, title: 'other key' }, 'other object value?');

      cache.get({ id: 1, title: 'first key' }).should.equal('first object value!');
      cache.get({ id: 2, title: 'other key' }).should.equal('other object value?');
    });
  });
});
