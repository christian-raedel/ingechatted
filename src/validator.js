'use strict';

/**
 * Create a new validator object
 */
var Validator = function constructor(parentId) {
    this._debug = require('debug')(parentId + ':validator');
    this._debug('validator object created');
};

/**
 * Check if a value is 'undefined' or 'null'
 * @param value
 * @returns {boolean}
 */
Validator.prototype.isDefined = function isDefined(value) {
    var defined = (typeof value !== 'undefined' && value !== null);
    this._debug('"' + value + '" is ' + (defined ? 'defined' : 'undefined'));
    return defined;
};

/**
 * Check whether a object is a valid object with id set
 * @param value
 * @returns {boolean}
 */
Validator.prototype.validateObject = function validateObject(value) {
    var valid = (this.isDefined(value) && (typeof value === 'object' &&
        Object.keys(value).length > 0 && this.isDefined(value.id)) ||
        (typeof value !== 'object' && this.isDefined(value)));
    this._debug('"' + value + '" is ' + this._stateString(valid));
    return valid;
};

/**
 * Check whether a callback is a valid function
 * @param value
 * @returns {boolean}
 */
Validator.prototype.validateCallback = function validateCallback(value) {
    var valid = (this.isDefined(value) && typeof value === 'function');
    this._debug('"' + value + '" is ' + this._stateString(valid));
    return valid;
};

Validator.prototype.validateArguments = function validateArguments() {
    var args = [].slice.call(arguments, 0),
        valid = false;
    for(var i = 0, max = args.length; i < max - 1; i += 1) {
        valid = this.validateObject(args[i]);
        if (!valid) {
            return false;
        }
    }
    valid = this.validateCallback(args[args.length - 1]);
    this._debug('"' + args + '" is ' + this._stateString(valid));
    return valid;
};

/**
 * Private helper methods
 * ----------------------
 */

/**
 * Return the string representation of a validation
 * @param valid
 * @returns {string}
 */
Validator.prototype._stateString = function _getStateString(valid) {
    return valid ? 'valid' : 'invalid';
};

/**
 * Module exports
 * @type {{validateCallback: validateCallback}}
 */
module.exports = Validator;
