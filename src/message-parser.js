'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter;

function MessageParser(manager) {
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

util.inherits(MessageParser, EventEmitter);

MessageParser.prototype.parse = function(ws, message, callback) {
    this.MESSAGETYPES[message.type].response(ws, message, callback);
};

MessageParser.prototype.__defineGetter__('MESSAGETYPES', function() {
    var self = this;
    return {
        AUTH: {
            request: function (ws) {
                if (!ws) {
                    throw new Error('no websocket connection available');
                }
                ws.send(JSON.stringify({ "type": "AUTH" }));
            },
            response: function (ws, message, callback) {
                if (arguments.length < 3) {
                    throw new Error('invalid arguments to parse AUTH response');
                }
                /*
                 if (!message.id || message.id !== ws.id) {
                 return callback(new Error('invalid session id'));
                 }
                 */
                self.manager.users.find('name', message.name, function (err, users) {
                    if (err) {
                        return callback(err);
                    }
                    if (users[0].password === message.password) {

                        var user = {
                            name: users[0].name,
                            connection: ws
                        };
                        self.manager.authenticated.add(user, function (err, user) {
                            if (err) {
                                return callback(err);
                            }
                            callback(null, true);
                        });
                    }
                });
            }
        },
        BROADCAST: {
            request: function(ws, message) {
                var users = self.manager.authenticated.store.filter(function(user) {
                    return user.ws !== ws;
                });
                for (var i = 0; i < users.length; i++) {
                    users[i].ws.send(JSON.stringify({
                        type: 'MESSAGE',
                        data: message
                    }));
                }
            },
            response: function(ws, message, callback) {
                var users = self.manager.authenticated.store.filter(function(user) {
                    return user.ws !== ws;
                });
                for (var i = 0; i < users.length; i++) {
                    users[i].ws.send(JSON.stringify({
                        type: 'MESSAGE',
                        data: message
                    }));
                }
            }
        }
    };
});

module.exports = MessageParser;
