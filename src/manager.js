'use strict';

var Model = require('./model');

function Manager(name, config, opts) {
    if (arguments.length < 2) {
        throw new Error('invalid arguments to create a manager');
    }
    this.name = name;
    this.schemes = require(config);
    for (var key in this.schemes) {
        if (this.schemes.hasOwnProperty(key)) {
            this[key] = new Model(key, this.schemes[key], opts);
        }
    }
    this.debug = require('debug')('model:manager:' + this.name);
    this.debug('created');
}

module.exports = Manager;
