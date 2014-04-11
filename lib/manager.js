'use strict';

var config = require('./config'),
    Model = require('./model');

function Manager(opts) {
    this.schemes = require(__dirname + '/../' + config.models);
    for (var key in this.schemes) {
        if (this.schemes.hasOwnProperty(key)) {
            this[key] = new Model(key, this.schemes[key], opts);
            if (opts && opts.debug && opts.debug[key]) {
                this[key].store = opts.debug[key];
            }
        }
    }
    this.debug = require('debug')(config.name + ':manager');
    this.debug('created');
}

module.exports = exports = Manager;
