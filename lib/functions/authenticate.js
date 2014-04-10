'use strict';

var debug = require('debug')('functions:authenticate'),
    autobahn = require('autobahn'),
    manager = require('../functions').manager;

function authenticate(args, kwargs, details) {
    try {
        if (!kwargs) {
            return null;
        }
        var users = manager.users.find('name', kwargs.username);
        if (users.length === 0 || users[0].password !== kwargs.password ||
            !manager.authenticated.add({ name: users[0].name })) {
            return null;
        }
        debug('user ' + users[0].name + ' authenticated');
        return manager.channels.find('public', true);
    } catch (err) {
        throw new autobahn.Error(err.message, err.id);
    }
}

module.exports = exports = authenticate;
