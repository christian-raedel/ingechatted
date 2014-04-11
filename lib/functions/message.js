'use strict';

var config = require('../config'),
    debug = require('debug')(config.name + ':functions:message'),
    autobahn = require('autobahn'),
    manager = require('../functions').manager;

function message(arg, kwargs, details) {
    try {
        debug('begin');
        if(!kwargs || manager.authenticated.find('name', kwargs.from).length === 0) {
            debug('end');
            return -1;
        }
        var idx = manager.messages.add(kwargs);
        debug('end [' + idx + ']');
        return idx;
    } catch(err) {
        debug('error: [' + err.id + '] ' + err.message);
        throw new autobahn.Error('message', 1000);
    }
}

module.exports = exports = message;
