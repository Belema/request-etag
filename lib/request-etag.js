'use strict';

var Cache = require('./cache');
var assign = require('lodash.assign');

function getHeaderValue(headers, name) {
  var value;
  Object.keys(headers || {}).forEach(function (key) {
    if (key.toLowerCase() === name) {
      value = headers[key];
    }
  });
  return value;
}

function parseParameters(uri, options, callback) {
  if (typeof options === 'object') {
    return {
      options: assign(options, { uri: uri }),
      callback: callback
    };
  }
  if (typeof uri === 'string') {
    if (typeof callback === 'function') {
      return {
        options: { uri: uri },
        callback: callback
      };
    }
    return {
      options: { uri: uri },
      callback: options
    };
  }
  return {
    options: uri,
    callback: options
  };
}

function getRequest(cache, request) {
  return function (uri, options, callback) {
    var parameters = parseParameters(uri, options, callback);
    parameters.options.headers = parameters.options.headers || {};

    if (getHeaderValue(parameters.options.headers, 'cookie')) {
      return request.get(parameters.options, parameters.callback);
    }

    var cacheHit = cache.get(parameters.options);
    if (cacheHit) {
      parameters.options.headers['If-None-Match'] = cacheHit.etag;
    }

    return request.get(parameters.options, function (error, response, body) {
      if (!error) {
        if (response.statusCode === 200) {
          var etag = getHeaderValue(response.headers, 'etag');
          if (etag) {
            delete parameters.options.headers['If-None-Match'];
            cache.set(parameters.options, { data: body, etag: etag });
          }
        }
        if (response.statusCode === 304) {
          body = cacheHit.data;
        }
      }
      parameters.callback(error, response, body);
    });
  };
}

function Request(cacheConfig, baseRequest) {
  var cache = new Cache(cacheConfig);
  var request = baseRequest || require('request');

  return {
    get: getRequest(cache, request),
    reset: cache.reset
  };
}

module.exports = Request;
