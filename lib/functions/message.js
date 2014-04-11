'use strict';

var debug = require('debug')('functions:message'),
    autobahn = require('autobahn'),
    manager = require('../functions').manager;

function message(arg, kwargs, details) {
    try {
        if(!kwargs || manager.authenticated.find('name', kwargs.from).length === 0) {
            return null;
        }
        return manager.messages.add(kwargs);
    } catch(err) {
        throw new autobahn.Error('message', 1000);
    }
}

module.exports = exports = message;
