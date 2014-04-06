'use strict';

var should = require('should'),
    util = require('../src/util');

describe('Util', function() {
    describe('#isObject', function() {
        it('should return true, if argument is an object', function() {
            util.isObject({}).should.be.true;
        });

        it('should return false, if argument is not an object', function() {
            util.isObject('').should.be.false;
        });
    });

    describe('#extend', function() {
        var src = { id: '001' },
            obj = { name: 'ingelise' },
            dst = { id: '001', name: 'ingelise' };

        it('should return null, if argument count not equal 2', function() {
            should(util.extend(src)).be.not.ok;
            should(util.extend(src, src, src)).be.not.ok;
        });

        it('should return null, if source is not an object', function() {
            should(util.extend('ingelise', obj)).be.not.ok;
        });

        it('should return null, if object is not an object', function() {
            should(util.extend(src, 'ingelise')).be.not.ok;
        });

        it('should extend one object with another', function() {
            util.extend(src, obj).should.be.eql(dst);
        });
    });
});
