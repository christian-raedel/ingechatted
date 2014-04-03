'use strict';

var Validator = require('./validator');

/**
 * Create a new object-list with given id and redis-connection
 * @param config
 * @constructor
 */
var ObjectList = function(config) {
    if (!config) {
        throw new Error('no config-object provided');
    } else if (!config.redis) {
        throw new Error('no "redis"-connection provided');
    } else if (!config.id) {
        throw new Error('invalid "id"-field');
    }

    this.id = config.id;
    this._db = config.redis;
    this._validator = new Validator(this.id);
    this._debug = require('debug')('object-list:' + this.id);
    this._debug('object-list "' + this.id + '" created');
};

/**
 * Insert a new object into the database
 * @param object
 * @param callback
 * @returns {*}
 */
ObjectList.prototype.add = function add(object, callback) {
    this._validateArguments(object, callback);
    var queryId = this._getQueryId(object.id),
        self = this;
    this._debug('add: ' + queryId);
    this._db.HMSET(queryId, object, function (error, object) {
        self._handleQueryResult(error, object, callback);
    });
};

/**
 * Removes an object with given id from the database
 * @param id
 * @param callback
 * @returns {*}
 */
ObjectList.prototype.delete = function deleteById(id, callback) {
    this._validateArguments(id, callback);
    var queryId = this._getQueryId(id),
        self = this;
    this._debug('delete: ' + queryId);
    this._db.DEL(queryId, function(error, object) {
        self._handleQueryResult(error, object, callback);
    });
};

/**
 * Search the database for an object by given id
 * @param id
 * @param callback
 * @returns {*}
 */
ObjectList.prototype.find = function findById(id, callback) {
    this._validateArguments(id, callback);
    var queryId = this._getQueryId(id),
        self = this;
    this._debug('find: ' + queryId);
    this._db.HGETALL(queryId, function(error, object) {
        self._handleQueryResult(error, object, callback);
    });
};

ObjectList.prototype.destroy = function destructor() {
    this._debug('destroyed');
};

/**
 * Private helper methods
 * ----------------------
 */

/**
 * Concatenate list id with given object id
 * @param id
 * @returns {string}
 */
ObjectList.prototype._getQueryId = function getQueryId(id) {
    return [ this.id, id ].join(':');
};

/**
 * Eventhandler for database queries
 * @param error
 * @param object
 * @param callback
 * @returns {*}
 */
ObjectList.prototype._handleQueryResult = function handleQueryResult(error, object, callback) {
    if (arguments.length !== 3) {
        throw new Error('invalid arguments');
    } else if (error) {
        return callback(error);
    }
    callback(null, object);
};

ObjectList.prototype._validateArguments = function validateArguments() {
    var valid = this._validator.validateArguments.apply(this._validator, arguments);
    if (!valid) {
        throw new Error('invalid arguments');
    }
    return valid;
};

/**
 * Module definition
 * @type {ObjectList}
 */
module.exports = ObjectList;
