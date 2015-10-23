/*
 * rfg-api.js
 * https://github.com/RealFaviconGenerator/rfg-api.js
 *
 * Copyright (c) 2014 Philippe Bernard & Hayden Bleasel
 * Licensed under the MIT license.
 */

/*jslint node:true*/
module.exports.init = function () {

  'use strict';

  var exports = {};
  var Client = require('node-rest-client').Client;
  var http = require('https');
  var fs = require('fs');
  var unzip = require('unzip');
  var metaparser = require('metaparser');
  var fstream = require('fstream');
  var mkdirp = require('mkdirp');

  exports.fileToBase64 = function (file, callback) {
    fs.readFile(file, { encoding: null }, function (error, file) {
      if (error) {
        callback(error);
      }
      else {
        callback(undefined, file.toString('base64'));
      }
    });
  };

  exports.generateFavicon = function (request, dest, callback) {
    var client = new Client();
    var args = {
      data: {
        "favicon_generation": request
      },
      headers: {
        "Content-Type": "application/json"
      }
    };
    mkdirp(dest, function () {
      client.post("https://realfavicongenerator.net/api/favicon", args, function (data, response) {
        if (response.statusCode !== 200) {
          throw console.log(data);
        }

        var writeStream = fstream.Writer(dest);
        writeStream.on('close', function () {
          callback(data.favicon_generation_result);
        });

        var parserStream = unzip.Parse();
        var request = http.get(data.favicon_generation_result.favicon.package_url, function (response) {
          response.pipe(parserStream).pipe(writeStream);
        });
      });
    });
  };

  exports.injectFaviconMarkups = function (file, htmlCode, opts, callback) {
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
      callback: function (error, html) {
        return callback(error, html);
      }
    });
  };

  return exports;
};
