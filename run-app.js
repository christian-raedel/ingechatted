(function () {
    'use strict';

    var server = require('./lib/server').createServer();

    server.on('shutdown', function(reason) {
        process.exit(reason);
    });
}(this));
