'use strict';

var config = require('./config/' + (process.env.NODE_ENV === 'production' ? 'production.json' : 'development.json')),
    debug = require('debug')(config.name),
    autobahn = require('autobahn'),
    when = require('when'),
    Functions = require('./lib/functions');

var functions = new Functions(),
    connection = new autobahn.Connection({
        url  : config.url,
        realm: config.name
    });

connection.onopen = function (session) {
    debug('server connection to ' + session.realm + ' open [id: ' + session.id + ']');

    functions.on('loaded', function (stack) {
        var register = [];
        for (var name in stack) {
            if (stack.hasOwnProperty(name)) {
                register.push(session.register(name, stack[name]));
            }
        }
        when.all(register).then(
            function (registered) {
                debug('[' + registered.length + '] functions registered');
            },
            function (err) {
                throw err;
            }
        );
    });

    functions.load(config.functions);
};

connection.onclose = function (reason, details) {
    debug('server connection closed: ' + reason + ' (' + details + ')');
    if (reason === 'closed') {
        process.exit(1);
    }
};

connection.open();
