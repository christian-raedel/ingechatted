'use strict';

var manager = require('../lib/manager');

describe('Manager', function () {
    describe('#constructor', function () {
        var inge;

        it('should create a new model-manager', function () {
            inge = manager.createManager(__dirname + '/../config/models.json');
            inge.should.be.an.instanceOf(manager.Manager);
        });

        it('should has all models', function () {
            inge.users.should.be.an.instanceOf(manager.Model);
            inge.messages.should.be.an.instanceOf(manager.Model);
            inge.authenticated.should.be.an.instanceOf(manager.Model);
        });
    });
});
