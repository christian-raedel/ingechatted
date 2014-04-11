(function () {
    'use strict';

    var spawn = require('child_process').spawn,
        config = require('./lib/config'),
        debug = require('debug')(config.name + ':run-app'),
        app = require('./lib/app');

    if (!config.crossbar) {
        throw new Error('please specify crossbar executable');
    }

    var crossbar = spawn(config.crossbar, ['start'], { cwd: __dirname });
    crossbar.stdout.on('data', debug);
    crossbar.stderr.on('data', debug);
    crossbar.on('close', function() {
        server.shutdown();
    });

    var timeout = setTimeout(function() {
        var server = app.createServer();
        server.on('shutdown', function () {
            process.exit(0);
        });
        clearTimeout(timeout);
    }, 5000);
}(this));
