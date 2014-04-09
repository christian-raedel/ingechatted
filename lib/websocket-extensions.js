'use strict';

var WebSocket = require('ws');

WebSocket.prototype.push = function () {
    if (arguments.length === 0) {
        throw new Error('invalid arguments for sending a message');
    }
    if (!this.stack) {
        this.stack = [];
    }
    var args = [].splice.call(arguments, 0),
        sid = this.stack.push(args),
        message = [ sid ].concat(args);
    this.send(JSON.stringify(message));
};

WebSocket.prototype.parse = function(data) {
    try {
        var message = JSON.parse(data),
            uuid = message.shift(),
            sid = message.shift(),
            args = [];
        if (!this.uuid && uuid) {
            this.uuid = uuid;
        }
        if (this.stack) {
            args = this.stack[sid];
        }
        if (this.uuid === uuid) {
            this.emit('parse', message, args);
        }
    } catch (err) {
        this.emit('error', err);
    }
};
