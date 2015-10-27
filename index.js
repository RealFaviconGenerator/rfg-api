/*
 * rfg-api.js
 * https://github.com/RealFaviconGenerator/rfg-api.js
 *
 * Copyright (c) 2014 Philippe Bernard & Hayden Bleasel
 * Licensed under the MIT license.
 */

/*jslint node:true*/
module.exports.init = function() {

  'use strict';

  var exports = {};
  var Client = require('node-rest-client').Client;
  var http = require('http');
  var fs = require('fs');
  var unzip = require('unzip');
  var metaparser = require('metaparser');
  var fstream = require('fstream');
  var mkdirp = require('mkdirp');

  exports.fileToBase64 = function(file, callback) {
    fs.readFile(file, { encoding: null }, function(error, file) {
      if (error) {
        callback(error);
      }
      else {
        callback(undefined, file.toString('base64'));
      }
    });
  };

  exports.fileToBase64Sync = function(file) {
    return fs.readFileSync(file, { encoding: null }).toString('base64');
  };

  exports.generateFavicon = function(request, dest, callback) {
    var client = new Client();
    var args = {
      data: {
        "favicon_generation": request
      },
      headers: {
        "Content-Type": "application/json"
      }
    };

    mkdirp(dest, function() {
      client.post("http://realfavicongenerator.net/api/favicon", args, function(data, response) {
        if (response.statusCode !== 200) {
          throw console.log(data);
        }

        var writeStream = fstream.Writer(dest);
        writeStream.on('close', function() {
          callback(data.favicon_generation_result);
        });

        var parserStream = unzip.Parse();
        var request = http.get(data.favicon_generation_result.favicon.package_url, function (response) {
          response.pipe(parserStream).pipe(writeStream);
        });
      });
    });
  };

  exports.injectFaviconMarkups = function(file, htmlCode, opts, callback) {
    var defaultRemove = [
      'link[rel="shortcut icon"]',
      'link[rel="icon"]',
      'link[rel^="apple-touch-icon"]',
      'link[rel="manifest"]',
      'link[rel="yandex-tableau-widget"]',
      'meta[name^="msapplication"]',
      'meta[name="mobile-web-app-capable"]',
      'meta[name="theme-color"]',
      'meta[property="og:image"]'
    ];
    var add = typeof html_code === 'string' ? [htmlCode] : htmlCode;
    var remove = defaultRemove;

    if (opts) {
      if (opts.add) {
        add = add.concat(typeof opts.add === 'string' ? [opts.add] : opts.add);
      }
      if (opts.remove) {
        remove = remove.concat(typeof opts.remove === 'string' ? [opts.remove] : opts.remove);
      }
    }

    metaparser({
      source: file,
      add: add,
      remove: remove,
      callback: function(error, html) {
        return callback(error, html);
      }
    });
  };

  exports.camelCaseToUnderscore = function(s) {
    return s.replace(/(?:^|\.?)([A-Z])/g, function(x,y) {
      return "_" + y.toLowerCase()
    }).replace(/^_/, "");
  }

  exports.camelCaseToUnderscoreRequest = function(request) {
    if (request === undefined) {
      return undefined;
    }
    if (request.constructor === Array) {
      for (var i = 0; i < request.length; i++) {
        request[i] = exports.camelCaseToUnderscoreRequest(request[i]);
      }
    }
    else if (request.constructor === String) {
      return exports.camelCaseToUnderscore(request);
    }
    else if (request.constructor === Object) {
      var keys = Object.keys(request);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var uKey = exports.camelCaseToUnderscore(keys[j]);

        // Special case for some keys: content should be passed as is
        var keysToIgnore = [
          'scaling_algorithm',
          'name',
          'content',
          'param_name',
          'param_value',
          'description',
          'app_description',
          'developer_name',
          'app_name'];
        var newContent = (keysToIgnore.indexOf(uKey) >= 0)
          ? request[key]
          : exports.camelCaseToUnderscoreRequest(request[key]);

        if (key !== uKey) {
          request[uKey] = newContent;
          delete request[key];
        }
        else {
          request[key] = newContent;
        }
      }
    }

    return request;
  }


  return exports;
};
