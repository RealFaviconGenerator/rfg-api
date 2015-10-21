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

    var exports = {},
        Client = require('node-rest-client').Client,
        http = require('http'),
        fs = require('fs'),
        unzip = require('unzip'),
        metaparser = require('metaparser'),
        fstream = require('fstream'),
        mkdirp = require('mkdirp');

    exports.file_to_base64 = function (file, callback) {
        fs.readFile(file, { encoding: null }, function (error, file) {
            if (error) throw error;
            return callback(file.toString('base64'));
        });
    };

    exports.generate_favicon = function (favicon_generation_request, dest, callback) {
        var client = new Client(),
            args = {
                data: {
                    "favicon_generation": favicon_generation_request
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
                var writeStream = fstream.Writer(dest),
                    parserStream = unzip.Parse(),
                    request = http.get(data.favicon_generation_result.favicon.package_url, function (response) {
                        response.pipe(parserStream).pipe(writeStream);
                    });
                writeStream.on('close', function () {
                    callback(data.favicon_generation_result);
                });
            });
        });
    };

    exports.generate_favicon_markups = function (file, html_code, opts, callback) {
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
        ],
            add = typeof html_code === 'string' ? [html_code] : html_code,
            remove = defaultRemove;

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
                if (error) throw error;
                return callback(html, add);
            }
        });
    };

    return exports;
};
