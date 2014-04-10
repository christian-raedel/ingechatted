'use strict';

var WebSocket = require('ws'),
    wsExt = require('../lib/websocket-extensions');

function createWebSocket(fn) {
    var ws = WebSocket.createConnection('ws://127.0.0.1:3000', fn);
    ws.on('message', function(data) {
        ws.parse(data);
    });
    return ws;
}

describe('Server', function () {
    it('should receives the WELCOME message', function (done) {
        var ws = createWebSocket();
        ws.on('parse', function (message, args) {
            if (args.length === 0) {
                message[0].should.be.equal('welcome');
                message[1].should.be.equal('Welcome to "ingechatted"! Have fun...');
                done();
            }
        });
    });

    it('should executes authentication', function(done) {
        var ws = createWebSocket(function() {
            ws.push('authenticate', 'ingelise', 's3cr3t26');
        });
        ws.on('parse', function(message, args) {
            if (args && args[0] === 'authenticate') {
                message[0].should.be.equal('authenticated');
                message[1].should.be.eql([
                    { name: 'ingeworld' }
                ]);
                done();
            }
        });
    });
});
