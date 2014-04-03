'use strict';

var should = require('should'),
    Validator = require('../src/validator');

describe('Validator', function() {
    var validate;

    describe('#constructor', function() {
        it('should return a validator object', function() {
            validate = new Validator();
            validate.should.be.an.instanceOf(Validator);
        });
    });

    describe('#validations', function() {
        var object = { id: '001', name: 'ingelise' },
            callback = function callback(error, object) {};

        it('should return "true", if an object is defined', function() {
            validate.isDefined(object).should.be.true;
            validate.isDefined(object.id).should.be.true;
        });

        it('should return "false", if an object is not defined or has no "id"-field set', function() {
            validate.isDefined(undefined).should.be.false;
            validate.isDefined(null).should.be.false;
        });

        it('should return "true", if an object is valid', function() {
            validate.validateObject(object).should.be.true;
            validate.validateObject(object.id).should.be.true;
        });

        it('should return "false", if an object is invalid', function() {
            validate.validateObject({}).should.be.false;
            validate.validateObject(null).should.be.false;
        });

        it('should return "true", if a callback is a function', function() {
            validate.validateCallback(callback).should.be.true;
        });

        it('should return "false", if a callback is not a function or is not defined', function() {
            validate.validateCallback({}).should.be.false;
            validate.validateCallback(undefined).should.be.false;
            validate.validateCallback(null).should.be.false;
        });

        it('should return "true", if a list of arguments is valid', function() {
            validate.validateArguments(callback).should.be.true;
            validate.validateArguments(object, callback).should.be.true;
            validate.validateArguments(object, object, callback).should.be.true;
        });

        it('should return "false", if a list of arguments is invalid', function() {
            validate.validateArguments(object).should.be.false;
            validate.validateArguments(object, object).should.be.false;
            validate.validateArguments(object, callback, object).should.be.false;
        });
    })
});
