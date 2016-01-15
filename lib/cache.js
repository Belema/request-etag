'use strict';

var LRU = require('lru-cache');
var crypto = require('crypto');

function createKey(input) {
  var key = JSON.stringify(input);
  return crypto.createHash('sha1').update(key).digest('hex');
}

function get(cache) {
  return function (options) {
    var cacheKey = createKey(options);
    return cache.get(cacheKey);
  };
}

function set(cache) {
  return function (options, data) {
    var cacheKey = createKey(options);
    cache.set(cacheKey, data);
  };
}

function Cache(config) {
  var cache = new LRU(config);
  return {
    get: get(cache),
    set: set(cache),
    reset: cache.reset.bind(cache)
  };
}

module.exports = Cache;
