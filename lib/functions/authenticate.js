(function() {
  'use strict';

  var config = require('../config'),
      debug = require('debug')(config.name + ':functions:authenticate'),
      autobahn = require('autobahn'),
      manager = require('../functions').manager;

  function authenticate(args, kwargs, details) {
    try {
      if (!kwargs) {
        return null;
      }
      debug('begin [' + kwargs.name + ']');
      var users = manager.users.find('name', kwargs.name);
      if (users.length === 0 || users[0].password !== kwargs.password || !manager.authenticated.add({ name: users[0].name })) {
        debug('end');
        return null;
      }
      debug('end [' + users[0].name + ']');
      return manager.channels.find('public', true);
    } catch (err) {
      debug('error: [' + err.id + '] ' + err.message);
      throw new autobahn.Error(err.message, err.id);
    }
  }

  module.exports = exports = authenticate;
}(this));
