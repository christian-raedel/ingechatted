'use strict';

var WebSocket = require('ws');

function getWebSocket() {
    return new WebSocket('ws://127.0.0.1:3000');
}

describe('WebSocket', function() {
    describe('#AUTH', function() {
        it('receives message', function(done) {
            var ws = getWebSocket();
            ws.onmessage = function(message) {
                message = JSON.parse(message.data);
                message.type.should.be.equal('AUTH');
                done();
            };
        });

        it('sends message', function(done) {
            var ws = getWebSocket();
            ws.send(JSON.stringify({
                name: 'ingelise',
            }))
        })
    });
});
