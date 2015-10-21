/*jslint node:true*/

(function () {

    'use strict';

    var api = require('./index.js').init(),
        request = require('./test/request.json'),
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

    api.file_to_base64('test/sample_picture.png', function (file) {
        console.log('Generated base64 file: ' + file.substr(0, 10) + '...');
    });

    api.generate_favicon(request, 'test/favicons/', function (data) {
        console.log('Generated favicons data: ' + data);
    });

    api.generate_favicon_markups('test/index.html', markup, opts, function (html, add) {
        console.log('Generated favicon markup: ' + html.substr(0, 10) + '... with elements added: ' + add.join('').substr(0, 10) + '...');
    });

}());
