'use strict';

var Cache = require('./cache');
var request = require('request');
var assign = require('lodash.assign');

function hasCoockieHeader(input) {
  return input &&
    input.headers &&
    Object.keys(input.headers).some(function (h) { return h.toLowerCase() === 'cookie'; });
}

function getEtag(headers) {
  var etag;
  Object.keys(headers || {}).forEach(function (name) {
    if (name.toLowerCase() === 'etag') {
      etag = headers[name];
    }
  });
  return etag;
}

function parseArguments(uri, options) {
  if (typeof options === 'object') {
    return assign(options, { uri: uri });
  }
  if (typeof uri === 'string') {
    return { uri: uri };
  }
  return uri;
}

function get(cache) {
  return function (uri, options, callback) {
    var originalOptions = options = parseArguments(uri, options);

    if (hasCoockieHeader(options)) {
      return request.get(options, callback);
    }

    var cacheHit = cache.get(options);
    if (cacheHit) {
      options.headers['If-None-Match'] = cacheHit.etag;
    }

    return request.get(options, function (error, response, body) {
      if (!error) {
        if (response.statusCode === 200) {
          var etag = getEtag(response.headers);
          if (etag) {
            cache.set(originalOptions, { data: body, etag: etag });
          }
        }
        if (response.statusCode === 304) {
          body = cacheHit.data;
        }
      }
      callback(error, response, body);
    });
  };
}

module.exports = function (config) {
  var cache = new Cache(config);
  return { get: get(cache) };
};
