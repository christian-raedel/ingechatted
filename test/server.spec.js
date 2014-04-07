'use strict';

var WebSocketClient = require('websocket').client;

describe('WebSocket', function() {
    describe('#AUTH', function() {
        it('receive messages', function(done) {
            var client = new WebSocketClient();
            client.on('connect', function(connection) {
                connection.should.be.ok;
                done();
                connection.on('message', function(message) {
                    console.log(message);
                    message.should.be.ok;
                    done();
                });
            });
            client.connect('ws://127.0.0.1:3000');
        });
    });
});
