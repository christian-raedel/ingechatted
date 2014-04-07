'use strict';

var uuid = require('uuid'),
    bcrypt = require('bcrypt');

function MessageParser(manager) {
    if (arguments.length < 1) {
        throw new Error('invalid arguments to create a message-parser');
    }
    if (!manager) {
        throw new Error('no model-manager provided');
    }
    this.manager = manager;
    this.debug = require('debug')('message-parser');
    this.debug('message-parser for manager ' + this.manager.name + ' created');
}

MessageParser.prototype.parse = function(connection, message, callback) {
    if (arguments.length < 3) {
        throw new Error('invalid arguments to parse message');
    }
    var type = message.type;
    this.MESSAGETYPES()[type].respone(connection, message, callback);
};

MessageParser.prototype.request = function(connection, type) {
    if (arguments.length < 2) {
        throw new Error('invalid arguments to create request');
    }
    this.MESSAGETYPES()[type].request(connection);
};

MessageParser.prototype.MESSAGETYPES = function() {
    var self = this;
    return {
        'AUTH': {
            request: function (connection) {
                if (!connection) {
                    throw new Error('no websocket connection available');
                }
                connection.id = uuid.v4();
                connection.sendUTF(JSON.stringify({
                    "type": "AUTH",
                    "id": connection.id
                }));
            },
            response: function (connection, message, callback) {
                if (arguments.length < 3) {
                    throw new Error('invalid arguments to parse AUTH response');
                }
                if (!message.id || message.id !== connection.id) {
                    return callback(new Error('invalid session id'));
                }
                self.manager.users.find('name', message.name, function(err, users) {
                    if (err) {
                        return callback(err);
                    }
                    if (users[0].password === message.password) {

                        var user = {
                            name: users[0].name
                        };
                        self.manager.authenticated.add(user, function(err, user) {
                            if (err) {
                                return callback(err);
                            }
                            callback(null, 'WELCOME');// TODO: callback(null, valid);
                        });
                    }
                });
            }
        }
    }
};

module.exports = MessageParser;
