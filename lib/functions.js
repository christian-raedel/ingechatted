'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter;

function Functions(manager) {
    if (arguments.length < 1) {
        throw new Error('invalid arguments to create a message-parser');
    }
    if (!manager) {
        throw new Error('no model-manager provided');
    }
    EventEmitter.call(this);
    this.manager = manager;
    this.debug = require('debug')('message-parser');
    this.debug('message-parser for manager ' + this.manager.name + ' created');
}

util.inherits(Functions, EventEmitter);

Functions.prototype.callFunction = function (name, args) {
    if (this.stack.hasOwnProperty(name)) {
        args.push(this.stack[name].remote);
        this.stack[name].local.apply(this, args);
    }
};

Functions.prototype.stack = {
    authenticate: {
        local: function (username, password, remote) {
            var self = this;
            self.manager.users.find('name', username, function (err, users) {
                if (err) {
                    self.emit('error', err);
                }
                var user = users[0];
                if (user.password === password) {
                    self.manager.authenticated.add(user, function (err, user) {
                        self.emit('finish', remote, self.manager.channels.store); // TODO: send channel list
                    });
                }
            });
        },
        remote: 'authenticated'
    },
    broadcast: function (message) {
        var self = this;
        self.manager.messages.add(message, function (err, message) {
            if (err) {
                self.emit('error', err);
            }
            self.emit('finish', self.manager.authenticated.length);
        });
    },
    message: function (message) {
        var self = this;
        self.manager.users.find('name', message.receiver, function (err, users) {
            if (err) {
                self.emit('error', err);
            }
            if (users[0]) {
                self.manager.messages.add(message, function (err, message) {
                    if (err) {
                        self.emit('error', err);
                    }
                    self.emit('finish', new Date().valueOf());
                });
            }
        });
    }
};

module.exports = Functions;
