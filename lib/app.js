'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    autobahn = require('autobahn'),
    when = require('when'),
    monitor = require('when/monitor/console'),
    config = require('./config'),
    Functions = require('./functions');

function Server() {
    var self = this;
    EventEmitter.call(self);
    this.debug = require('debug')(config.name);
    this.functions = new Functions();
    this.connection = new autobahn.Connection({
        url  : config.url,
        realm: config.name
    });

    this.connection.onopen = function (session) {
        self.debug('server connection to [' + session.realm + '] realm open [id: ' + session.id + ']');

        self.functions.on('loaded', function (stack) {
            var register = [];
            for (var name in stack) {
                if (stack.hasOwnProperty(name)) {
                    register.push(session.register(name, stack[name]));
                }
            }
            when.all(register)
                .done(function (registered) {
                    self.debug('[' + registered.length + '] functions registered');
                    self.emit('ready');
                },
                function (err) {
                    self.emit('error', err);
                });
        });

        self.functions.load();

        self.functions.manager.messages.on('object-added', function (obj) {
            if (!obj || !obj.to) {
                self.debug('publish message failure');
            }
            var opts = {};
            if (obj.eligible) {
                opts.eligible = obj.eligible;
                delete obj.eligible;
            }
            session.publish(obj.to, [], obj, opts);
        });
    };

    this.connection.onclose = function (reason, details) {
        self.debug('server connection closed: ' + reason + ' (' + details + ')');
        self.connection = null;
        self.emit('shutdown');
    };

    this.connection.open();
}

util.inherits(Server, EventEmitter);

Server.prototype.shutdown = function() {
    var reason = 'server shutdown';
    this.debug(reason);
    if (this.connection) {
        this.connection.onclose(reason);
    }
};

function Client() {
    var self = this;
    EventEmitter.call(self);
    this.debug = require('debug')(config.name + ':client');
    this.connection = new autobahn.Connection({
        url  : config.url,
        realm: config.name
    });

    this.session = null;
    this.connection.onopen = function(session) {
        self.session = session;
        self.debug('connected');
        self.emit('ready');
    };

    this.connection.onclose = function(reason, details) {
        self.debug('disconnected: ' + reason);
        self.session = null;
        self.emit('shutdown');
    };

    this.connection.open();
}

util.inherits(Client, EventEmitter);

Client.prototype.shutdown = function() {
    var reason = 'client shutdown';
    this.debug(reason);
    if (this.connection) {
        this.connection.onclose(reason);
    }
};

module.exports.createServer = function() {
    return new Server();
};

module.exports.createClient = function() {
    return new Client();
};
