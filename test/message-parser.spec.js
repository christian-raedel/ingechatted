'use strict';

var should = require('should'),
    Model = require('../src/model'),
    Manager = require('../src/manager'),
    MessageParser = require('../src/message-parser');

var manager, parser,
    user = {
        name: 'ingelise',
        password: 's3cr3t26'
    };

describe('Manager', function() {
    describe('#constructor', function() {
        it('should create a new model-manager', function() {
            manager = new Manager('cid', __dirname + '/../config/models.json');
            manager.should.be.an.instanceOf(Manager);
            manager.users.should.be.ok;
        });

        it('should has all models', function() {
            manager.users.should.be.an.instanceOf(Model);
            manager.messages.should.be.an.instanceOf(Model);
            manager.authenticated.should.be.an.instanceOf(Model);
        });
    });
});

describe('MessageParser', function() {
    describe('#constructor', function() {
        it('should create a new message parser', function() {
            parser = new MessageParser(manager);
            parser.should.be.an.instanceOf(MessageParser);
        });
    });

    describe('#AUTH', function() {
        it('should return a valid response', function(done) {
            var id = '001',
                connection = { id: id },
                message = {
                    type: 'AUTH',
                    id: id,
                    name: user.name,
                    password: user.password
                };
            manager = new Manager('cid', __dirname + '/../config/models.json');
            manager.users.store = [ user ];
            parser = new MessageParser(manager);
            parser.MESSAGETYPES.AUTH.response(connection, message, function(err, next) {
                should(err).be.not.ok;
                next.should.be.equal('WELCOME');
                done();
            });
        });
    });
});
