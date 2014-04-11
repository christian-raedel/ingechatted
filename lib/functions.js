'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    fs = require('fs'),
    redis = require('redis'),
    config = require('./config'),
    Manager = require('./manager');

var db = redis.createClient(config.redis.port || 6437, config.redis.host || '127.0.0.1'),
    manager = new Manager({ redis: db, debug: config.content });

function Functions() {
    EventEmitter.call(this);
    this.manager = manager;
    this.stack = {};
    this.debug = require('debug')(config.name + ':functions');
    this.debug('created');
}

util.inherits(Functions, EventEmitter);

Functions.prototype.load = function() {
    var dirname = __dirname + '/functions';
    try {
        var self = this,
            files = fs.readdirSync(dirname);
        files.forEach(function (file) {
            file = file.substring(0, file.lastIndexOf('.'));
            self.stack[file] = require(dirname + '/' + file);
        });
        this.emit('loaded', this.stack);
        this.debug('[' + files.length + '] functions loaded');
    } catch (err) {
        throw err;
    }
};

module.exports = Functions;
module.exports.manager = manager;
