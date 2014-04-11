'use strict';

var should = require('should'),
    config = require('../../config/development.json'),
    autobahn = require('autobahn');

describe('Authentication function', function() {
    it('calls the function and returns authentication status', function(done) {
        var connection = new autobahn.Connection({ url: config.url, realm: config.name });

        connection.onopen = function(session) {
            session.call('authenticate', [], config.content.users[0])
                .then(function(res) {
                    res.length.should.be.equal(1);
                    connection.close();
                    done();
                })
                .catch(autobahn.Error, function(args, kwargs) {
                    should(args).be.not.ok;
                    should(kwargs).be.not.ok;
                });
        };

        connection.open();
    });
});
