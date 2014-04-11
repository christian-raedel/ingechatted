'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    autobahn = require('autobahn'),
    when = require('when'),
    config = require('./config'),
    Functions = require('./functions');

function Server() {
    var self = this;
    EventEmitter.call(self);
    self.debug = require('debug')(config.name);
    self.functions = new Functions();
    self.connection = new autobahn.Connection({
        url  : config.url,
        realm: config.name
    });


    self.connection.onopen = function (session) {
        self.debug('server connection to ' + session.realm + ' realm open [id: ' + session.id + ']');

        self.functions.on('loaded', function (stack) {
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

        self.functions.load(config.functions);

        self.functions.manager.messages.on('object-added', function (obj) {
            if (!obj || !obj.to) {
                debug('publish message failure');
            }
            var opts = {};
            if (obj.eligible) {
                opts.eligible = obj.eligible;
                delete obj.eligible;
            }
            session.publish(obj.to, [], obj, opts);
        })
    };

    self.connection.onclose = function (reason, details) {
        self.debug('server connection closed: ' + reason + ' (' + details + ')');
        this.shutdown(reason);
    };

    self.connection.open();
}

util.inherits(Server, EventEmitter);

Server.prototype.shutdown = function(reason) {
    debug('shutdown: ' + reason);
    this.connection.close();
    this.emit('shutdown', reason);
};

function Client() {
    var self = this;
    self.debug = require('debug')(config.name + ':client');
    self.connection = new autobahn.Connection({
        url  : config.url,
        realm: config.name
    });

    self.connection.onopen = function(session) {
        self.session = session;
        self.debug('connected');
    };

    self.connection.onclose = function(reason, details) {
        self.session = null;
        self.debug('disconnected: ' + reason);
    };
}

Client.prototype.shutdown = function(reason) {
    this.debug('shutdown: ' + reason);
    this.connection.close();
};

module.exports.createServer = function() {
    return new Server();
};

module.exports.createClient = function() {
    return new Client();
};
