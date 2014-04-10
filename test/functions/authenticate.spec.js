'use strict';

var should = require('should'),
    config = require('../../config/development.json'),
    autobahn = require('autobahn');

describe('Authentication function', function() {
    it('calls the function and returns authentication status', function(done) {
        var connection = new autobahn.Connection({ url: config.url, realm: config.name });

        connection.onopen = function(session) {
            session.call('authenticate', [], { username: 'ingelise', password: 's3cr3t26' })
                .then(function(res) {
                    res.length.should.be.equal(1);
                    connection.close();
                    done();
                });
        };

        connection.open();
    });
});
