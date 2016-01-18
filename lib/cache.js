'use strict';

var LRU = require('lru-cache');
var crypto = require('crypto');
var assign = require('lodash.assign');

function createKey(input) {
  var key = JSON.stringify(input);
  return crypto.createHash('sha1').update(key).digest('hex');
}

function length(item, key) {
  return (key ? key.length : 1) + JSON.stringify(item || 1).length;
}

function get(cache) {
  return function (options) {
    var cacheKey = createKey(options);
    return cache.get(cacheKey);
  };
}

function set(cache) {
  return function (options, item) {
    var cacheKey = createKey(options);
    cache.set(cacheKey, item);
  };
}

function Cache(config) {
  var cache = new LRU(assign({ length: length }, config));
  return {
    get: get(cache),
    set: set(cache),
    reset: cache.reset.bind(cache)
  };
}

module.exports = Cache;
