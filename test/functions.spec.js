'use strict';

var should = require('should'),
    config = require('../lib/config'),
    app = require('../lib/app'),
    Functions = require('../lib/functions'),
    user = config.content.users[0],
    channels = config.content.channels,
    message = config.content.messages[0];

describe('Functions', function() {
    describe('#constructor', function() {
        it('should constructs a valid functions object', function() {
            var functions = new Functions();
            functions.should.be.an.instanceOf(Functions);
        });
    });

    describe('#function calls', function() {
        var server, client;

        before(function(done) {
            server = app.createServer();
            server.on('error', done);
            server.on('ready', function() {
                client = app.createClient();
                client.on('error', done);
                client.on('ready', done);
            });
        });

        it('should calls the authenticate function', function(done) {
            client.session.should.be.ok;
            client.session
                .call('authenticate', [], user)
                .then(function(res) {
                    res.should.be.eql(channels);
                    done();
                })
                .catch(done);
        });

        it('should send and receive a message', function(done) {
            client.session.should.be.ok;
            client.session.subscribe(channels[0].name, function(args, kwargs) {
                args.should.be.eql([]);
                kwargs.should.be.eql(message);
                done();
            });
            client.session
                .call('message', [], message)
                .then(function(res) {
                    res.should.be.greaterThan(-1);
                    done();
                })
                .catch(done);
        });

        after(function(done) {
            client.on('shutdown', function() {
                server.on('shutdown', done);
                server.shutdown();
            });
            client.shutdown();
        });
    });
});
