'use strict';

var should = require('should'),
    connection = require('redis').createClient(9024),
    Model = require('../lib/model');

describe('Model', function () {
    var name = 'users.spec',
        schema = {
            name: {
                type: 'string',
                required: true,
                unique: true,
                minLength: 3,
                maxLength: 9
            },
            lastLoginDate: {
                defaultValue: 'new Date().valueOf()',
                evalDefaultValue: true
            }
        },
        store = [
            { id: 1, name: 'ingelise' },
            { id: 2, name: 'liseinge' },
            { id: 3, name: 'ingelise' }
        ],
        sortedStore = [
            { id: 1, name: 'ingelise' },
            { id: 3, name: 'ingelise' },
            { id: 2, name: 'liseinge' }
        ];

    describe('#constructor', function () {
        it('should create a model', function () {
            var model = new Model(name, schema);
            model.should.be.an.instanceOf(Model);
        });

        it('should fail, if there are not enough arguments provided', function () {
            try {
                new Model(name);
            } catch (err) {
                err.should.be.ok;
            }
        });
    });

    describe('#indexOf', function () {
        it('should return -1, if the object is not in store', function () {
            var model = new Model(name, schema);
            model.indexOf('name', 'ingelise').should.be.equal(-1);
        });

        it('should return index, if object is in the store', function () {
            var model = new Model(name, schema);
            model.store = [
                { name: 'ingelise' }
            ];
            model.indexOf('name', 'ingelise').should.be.equal(0);
        });

        it('should return index, if another object is in the store', function () {
            var model = new Model(name, {});
            model.store = [
                { id: 1 }
            ];
            model.indexOf('id', 1).should.be.equal(0);
        });
    });

    describe('#validate', function () {
        it('should fail, if value is required and has no value', function (done) {
            var model = new Model(name, { name: { required: true }});
            model.validate('name', null, function (err) {
                err.should.be.ok;
                done();
            });
        });

        it('should fail, if value has not the same type', function (done) {
            var model = new Model(name, { name: { type: 'string' }});
            model.validate('name', {}, function (err) {
                err.should.be.ok;
                done();
            });
        });

        it('should fail, if value is not unique', function (done) {
            var model = new Model(name, { name: { unique: true }});
            model.store = [
                { name: 'ingelise' }
            ];
            model.validate('name', 'ingelise', function (err) {
                err.should.be.ok;
                done();
            });
        });

        it('should fail, when minLength is given', function (done) {
            var model = new Model(name, { name: { minLength: 3 }});
            model.validate('name', 'in', function (err) {
                err.should.be.ok;
                done();
            });
        });

        it('should fail, when maxLength is given', function (done) {
            var model = new Model(name, { name: { maxLength: 7 }});
            model.validate('name', 'ingelise', function (err) {
                err.should.be.ok;
                done();
            });
        });
    });

    describe('#add', function () {
        it('should add a valid object to models store', function (done) {
            var model = new Model(name, schema),
                user = { name: 'ingelise' };
            model.add(user, function (err, obj) {
                should(err).not.be.ok;
                obj.should.be.eql(user);
                obj.lastLoginDate.should.be.ok;
                done();
            });
        });

        it('should add another object to models store', function (done) {
            var model = new Model(name, schema),
                user = { name: 'liseinge' };
            model.add(user, function (err, obj) {
                should(err).not.be.ok;
                obj.should.be.eql(user);
                done();
            });
        });
    });

    describe('#remove', function () {
        it('should remove an object from models store', function (done) {
            var model = new Model(name, {});
            model.store = store;
            model.remove('id', 2, function (err, res) {
                should(err).not.be.ok;
                res.should.be.equal(1);
                done();
            });
        });

        it('should remove more than one object from models store', function (done) {
            var model = new Model(name, {});
            model.store = store;
            model.remove('name', 'ingelise', function (err, res) {
                should(err).not.be.ok;
                res.should.be.eql(2);
                done();
            });
        });
    });

    describe('#find', function () {
        it('should return an array with found objects', function (done) {
            var model = new Model(name, {});
            model.store = store;
            model.find('name', 'ingelise', function (err, res) {
                should(err).be.not.ok;
                res.length.should.be.equal(2);
                done();
            });
        });

        it('should return an array with found objects with search by RegExp', function(done) {
            var model = new Model(name, {});
            model.store = store;
            model.find('name', '/inge.*/', function(err, res) {
                should(err).be.not.ok;
                res.length.should.be.equal(3);
                done();
            });
        });
    });

    describe('#sort', function () {
        it('should return an array with sorted objects', function (done) {
            var model = new Model(name, {});
            model.store = store;
            model.sort('name', function (err, res) {
                should(err).be.not.ok;
                res.should.be.eql(sortedStore);
                done();
            });
        });
    });

    describe('#length', function () {
        it('should return the length of the store', function () {
            var model = new Model(name, {});
            model.store = store;
            model.length.should.be.equal(3);
        });
    });

    describe('#save', function () {
        it('should save a model to the redis datastore', function (done) {
            var model = new Model(name, {}, { redis: connection });
            model.store = store;
            model.save(function (err, res) {
                should(err).be.not.ok;
                res.should.be.true;
                done();
            });
        });
    });

    describe('#load', function () {
        it('should load a model from the redis datastore', function (done) {
            var model = new Model(name, {}, { redis: connection });
            model.store.length.should.be.equal(0);
            model.load(function (err, res) {
                should(err).be.not.ok;
                res.should.be.equal(store.length);
                done();
            });
        });
    });

    describe('#empty', function () {
        it('should empty a model in the redis datastore', function (done) {
            var model = new Model(name, {}, { redis: connection });
            model.store = store;
            model.store.length.should.be.equal(3);
            model.empty(function (err, res) {
                should(err).be.not.ok;
                res.should.be.true;
                done();
            });
        });
    });
});
