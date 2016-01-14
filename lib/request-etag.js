'use strict';

var Cache = require('./cache');
var request = require('request');
var assign = require('lodash.assign');

function hasCoockieHeader(input) {
  return input &&
    input.headers &&
    Object.keys(input.headers).some(function (key) { return key.toLowerCase() === 'cookie'; });
}

function getEtag(headers) {
  var etag;
  Object.keys(headers || {}).forEach(function (key) {
    if (key.toLowerCase() === 'etag') {
      etag = headers[key];
    }
  });
  return etag;
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

function get(cache) {
  return function (uri, options, callback) {
    var parameters = parseParameters(uri, options, callback);

    if (hasCoockieHeader(parameters.options)) {
      return request.get(parameters.options, parameters.callback);
    }

    var cacheHit = cache.get(parameters.options);
    if (cacheHit) {
      parameters.options.headers['If-None-Match'] = cacheHit.etag;
    }

    return request.get(parameters.options, function (error, response, body) {
      if (!error) {
        if (response.statusCode === 200) {
          var etag = getEtag(response.headers);
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

function Request(config) {
  var cache = new Cache(config);
  return { get: get(cache) };
}

module.exports = Request;
