/*jslint node:true*/

(function () {

    'use strict';

    var api = require('../index.js').init(),
        request = require('./request.json'),
        markup = [
            '<link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192">',
            '<link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">'
        ],
        opts = {
            add: '<link rel="author" href="humans.txt" />',
            remove: [
                'link[href="favicons/favicon-192x192.png"]',
                'link[href="favicons/favicon-160x160.png"]'
            ]
        };
/*
    api.file_to_base64('test/sample_picture.png', function (file) {
        console.log('Generated base64 file: ' + file.substr(0, 10) + '...');
    });

    api.generate_favicon(request, './favicons/', function (data) {
        console.log('Generated favicons data: ' + data);
    });

    api.generate_favicon_markups('./index.html', markup, opts, function (html, add) {
        console.log('Generated favicon markup: ' + html.substr(0, 10) + '... with elements added: ' + add.join('').substr(0, 10) + '...');
    });
*/

  var assert = require('assert');
  var path = require('path');
  var rfg = require('../index.js').init();
  var fs = require('fs');

  describe('RFG Api', function() {
    describe('#fileToBase64()', function() {
      it('should return the content of a file encoded in base64', function(done) {
        rfg.fileToBase64(path.join(__dirname, 'input', 'very_small.png'), function(error, base64) {
          if (error) throw error;
          assert.equal(
            'iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAIAAAA2iEnWAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA' +
            'B3RJTUUH3woWBxkR5IGL1wAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUH' +
            'AAAAHElEQVQI1wXBgQAAAACDsAiCuD9TLN9IXbhSUuJAYwXpQ37pHAAAAABJRU5ErkJggg==',
            base64);
          done();
        });
      });

      it('should return an error when the file does not exist', function(done) {
        rfg.fileToBase64('oops', function(error, base64) {
          assert.notEqual(error, undefined);
          done();
        });
      });
    });

    describe('#fileToBase64Sync()', function() {
      it('should return the content of a file encoded in base64', function() {
        assert.equal(
          rfg.fileToBase64Sync(path.join(__dirname, 'input', 'very_small.png')),
          'iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAIAAAA2iEnWAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA' +
          'B3RJTUUH3woWBxkR5IGL1wAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUH' +
          'AAAAHElEQVQI1wXBgQAAAACDsAiCuD9TLN9IXbhSUuJAYwXpQ37pHAAAAABJRU5ErkJggg==');
      });
    });

    describe('#generateFavicon()', function() {
      this.timeout(5000);

      it('should generate a favicon', function(done) {
        rfg.fileToBase64(path.join(__dirname, 'input', 'master_picture.png'), function(error, base64) {
          assert.equal(error, undefined);
          var req = {
            "api_key": "f26d432783a1856427f32ed8793e1d457cc120f1",
            "master_picture": {
              "type": "inline",
              "content": base64
            },
            "files_location": {
              "type": "path",
              "path": "favicons/"
            },
            "favicon_design": {
              "ios": {
                "picture_aspect": "background_and_margin",
                "margin": "4",
                "background_color": "#123456"
              }
            },
            "settings": {
              "compression": 1,
              "scaling_algorithm": "NearestNeighbor"
            }
          };
          rfg.generateFavicon(req, path.join(__dirname, 'output'), function(result) {
            // Make sure iOS icons were generated, but not desktop icons
            assert(fs.statSync(path.join(__dirname, 'output', 'apple-touch-icon.png')).isFile());
            assert(! fs.existsSync(path.join(__dirname, 'output', 'favicon.ico')));

            // Make sure some code is returned
            assert(result.favicon.html_code);
            assert(result.favicon.html_code.length > 500);
            assert(result.favicon.html_code.length < 1500);

            done();
          });
        });
      });
    });

    describe('#injectFaviconMarkups()', function() {
      it('should inject favicon code', function(done) {
        var markups = [
          '<link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192">',
          '<link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">'
        ];
        rfg.injectFaviconMarkups(path.join(__dirname, 'input', 'test_1.html'), markups, {}, function(error, html) {
          var expected = fs.readFileSync(path.join(__dirname, 'input', 'test_1_expected_output.html')).toString();
          assert.equal(html, expected);

          done();
        });
      });

      it('should remove existing markups', function(done) {
        var markups = [
          '<link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192">',
          '<link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">'
        ];
        rfg.injectFaviconMarkups(path.join(__dirname, 'input', 'test_2.html'), markups, {}, function(error, html) {
          var expected = fs.readFileSync(path.join(__dirname, 'input', 'test_2_expected_output.html')).toString();
          assert.equal(html, expected);

          done();
        });
      });
    });

    describe('#camelCaseToUnderscore()', function() {
      it('should turn camel case to underscores', function() {
        // One word
        assert.equal('hello', rfg.camelCaseToUnderscore('hello'));
        // Two words
        assert.equal('hello_world', rfg.camelCaseToUnderscore('helloWorld'));
        // Long string and there are two consecutive uppercase letters
        assert.equal('hello_world_this_is_a_long_string', rfg.camelCaseToUnderscore('helloWorldThisIsALongString'));
        // First letter is uppercased
        assert.equal('hello', rfg.camelCaseToUnderscore('Hello'));
        // No effect on an underscore string
        assert.equal('hello_world', rfg.camelCaseToUnderscore('hello_world'));
      });
    });

  });

}());
