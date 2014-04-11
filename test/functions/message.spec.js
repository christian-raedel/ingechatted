'use strict';

var should = require('should'),
    config = require('../../config/development.json'),
    server = require('../../server').createServer,
    client = require('../../server').createClient;

describe('Message function', function() {
    it('should publish a message', function(done) {
        var user = config.content.users[0],
            message = config.content.messages[0];

        client.session.call('authenticate', [], user)
            .then(function(res) {
                res.length.should.be.equal(1);

                client.session.subscribe(res[0].name, function (args, kwargs) {
                    should(args).be.not.ok;
                    kwargs.should.be.eql(message);
                    server.shutdown('authenticate test');
                    client.shutdown();
                    done();
                });

                client.session.call('message', [], message).
                    then(function(res) {
                        res.should.be.ok;
                    });
            });
    });
});
