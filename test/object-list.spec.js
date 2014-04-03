'use strict';

var should = require('should'),
    db = require('redis').createClient(9024),
    ObjectList = require('../src/object-list');

describe('ObjectList', function() {
    var userList,
        user = { id: '001', name: 'ingelise' };

    describe('#constructor', function() {
        it('should throw an error on calls without configuration', function() {
            try {
                userList = new ObjectList();
            } catch (error) {
                error.should.be.ok;
            }
        });

        it('should throw an error on calls without configured "id"', function() {
            try {
                userList = new ObjectList({ redis: db });
            } catch (error) {
                error.should.be.ok;
            }
        });

        it('should throw an error on calls without configured "redis"-connection', function() {
            try {
                userList = new ObjectList({ id: 'users' });
            } catch (error) {
                error.should.be.ok;
            }
        });

        it('should return a defined object-list', function() {
            userList = new ObjectList({ id: 'users', redis: db });
            userList.should.be.an.instanceOf(ObjectList);
        });
    });

    describe('#add', function() {
        it('should add an object to the database', function(done) {
            var callback = function addCallback(error, object) {
                should(error).not.exists;
                object.should.be.equal('OK');
                done();
            };
            userList.add(user, callback);
        });
    });

    describe('#find', function() {
        it('should find an object in the database', function(done) {
            var callback = function findCallback(error, object) {
                should(error).not.exists;
                object.should.be.eql(user);
                done();
            };
            userList.find(user.id, callback);
        });
    });

    describe('#delete', function() {
        it('should delete an object from the database', function(done) {
            var callback = function deleteCallback(error, object) {
                should(error).not.exists;
                object.should.be.equal(1);
                done();
            };
            userList.delete(user.id, callback);
        });
    });

    describe('#destructor', function() {
        it('should destroy the object-list', function() {
            userList = null;
            should(userList).be.not.ok;
        });
    });
});
