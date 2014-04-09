'use strict';

var crypto = require('crypto');

/**
 * Constructs a new model instance with given name, schema and optional redis connection.
 * @param name
 * @param schema - arguments for all 'required' fields are 'type', 'unique', 'minLength' and 'maxLength'
 * @param opts - optional: 'redis'
 * @constructor
 */
function Model(name, schema, opts) {
    if (arguments.length < 1) {
        throw new Error('invalid arguments to construct a model');
    } else if (opts && opts.redis) {
        this.connection = opts.redis;
    }
    this.name = name;
    this.schema = schema || {};
    this.store = [];
    this.debug = require('debug')('model:' + this.name);
    this.debug('created');
}

/**
 * Gets the index of a field with specific value set
 * @param field
 * @param value
 * @returns {number} - '-1' if not found
 */
Model.prototype.indexOf = function (field, value) {
    if (arguments.length < 2) {
        throw new Error('invalid arguments to retrieve indexOf field-value');
    }
    var max = this.store.length,
        item, i;
    for (i = 0; i < max; i += 1) {
        item = this.store[i];
        if (item.hasOwnProperty(field) && item[field] === value) {
            return i;
        }
    }
    return -1;
};

/**
 * Validates an object and adds it to the store
 * @param obj
 * @param callback
 */
Model.prototype.add = function (obj, callback) {
    if (arguments.length !== 2) {
        throw new Error('invalid arguments to add an object to ' + this.name);
    }
    var field;
    for (field in this.schema) {
        if (this.schema.hasOwnProperty(field) && !obj.hasOwnProperty(field) &&
            this.schema[field].defaultValue) {
            if (this.schema[field].evalDefaultValue) {
                obj[field] = obj[field] || eval(this.schema[field].defaultValue) || null;
            } else {
                obj[field] = obj[field] || this.schema[field].defaultValue;
            }
        }
        if (this.schema.hasOwnProperty(field)) {
            if (this.schema[field].secure) {
                obj[field] = this.secure(obj[field], this.schema[field].secure);
            }
        }
    }
    for (field in obj) {
        if (obj.hasOwnProperty(field)) {
            this.validate(field, obj[field], callback);
        }
    }
    this.store.push(obj);
    callback(null, obj);
};

Model.prototype.secure = function(value, type) {
    if (arguments.length < 2 || typeof value !== 'string') {
        throw new Error('invalid arguments to secure a string');
    }
    switch (type) {
        default:
            return crypto.createHash('sha512').update(value).digest('hex');
    }
};

/**
 * Private method for validating a field-value pair
 * @param field
 * @param value
 * @param callback
 * @returns {*} - callback with Error, if not valid
 */
Model.prototype.validate = function (field, value, callback) {
    if (arguments.length !== 3) {
        throw new Error('invalid arguments to validate field');
    }
    var prototype = this.schema[field],
        msg = 'cannot validate ' + field;
    if (!prototype) {
        return callback(new Error(msg + ', because it is not in the schema'));
    }
    if (prototype.required && !value) {
        return callback(new Error(msg + ', because it has no value'));
    }
    if (prototype.type && prototype.type !== typeof value) {
        return callback(new Error(msg + ', because the value has not the defined type'));
    }
    if (prototype.unique && this.indexOf(field, value) > -1) {
        return callback(new Error(msg + ', because its value has to be unique'));
    }
    if (prototype.minLength && value.trim().length && value.trim().length < prototype.minLength) {
        return callback(new Error(msg + ', because it has defined minimum length'));
    }
    if (prototype.maxLength && value.trim().length && value.trim().length > prototype.maxLength) {
        return callback(new Error(msg + ', because it has defined maximum length'));
    }
};

/**
 * Removes all objects from store, where field-value pair is true
 * @param field
 * @param value
 * @param callback - with removed item count
 */
Model.prototype.remove = function (field, value, callback) {
    if (arguments.length < 3) {
        throw new Error('invalid arguments to remove an object from ' + this.name);
    }
    var count = 0;
    this.store = this.store.filter(function (item) {
        var remove = item[field] === value;
        if (remove) {
            count++;
        }
        return !remove;
    });
    callback(null, count);
};

/**
 * Finds a specific field-value combination
 * @param field
 * @param value
 * @param callback - with array with found objects
 */
Model.prototype.find = function (field, value, callback) {
    if (arguments.length < 3) {
        throw new Error('invalid arguments to find an object from ' + this.name);
    }
    var regex = null;
    if (typeof value === 'string') {
        var r = value.split('/');
        if (r.length === 3) {
            regex = new RegExp(r[1], r[2]);
        }
    }
    var result = this.store.filter(function (object) {
        if (regex) {
            return object[field].toString().match(regex);
        }
        return object[field] === value;
    });
    callback(null, result);
};

/**
 * Sorts the store and returns an array with objects
 * @param field
 * @param order - optional: one of 'ASC' (default) or 'DESC'
 * @param callback - with sorted result
 */
Model.prototype.sort = function (field, order, callback) {
    if (arguments.length < 2) {
        throw new Error('invalid arguments to sort ' + this.name);
    }
    if (typeof order === 'function') {
        callback = order;
        order = 'ASC';
    }
    var result = this.store.sort(function (a, b) {
        try {
            if (order.toUpperCase() === 'ASC') {
                return a[field] > b[field];
            } else {
                return a[field] < b[field];
            }
        } catch (err) {
            return callback(err);
        }
    });
    callback(null, result);
};

Model.prototype.__defineGetter__('length', function () {
    return this.store.length;
});

/**
 * Persists a store into redis database and sets the 'saved' member on model
 * @param callback
 * @returns {*} - 'true' on success
 */
Model.prototype.save = function (callback) {
    if (arguments.length < 1) {
        throw new Error('invalid arguments to save ' + this.name);
    }
    if (!this.connection) {
        return callback(new Error('failed to save ' + this.name + ', because there is no redis connection provided'));
    }
    var self = this,
        json = JSON.stringify(this.store);
    this.connection.SET(this.name, json, function (err, res) {
        if (err) {
            return callback(err);
        }
        if (res !== 'OK') {
            return callback(new Error('could not save ' + self.name));
        } else {
            self.saved = new Date();
            callback(null, true);
        }
    });
};

/**
 * Loads a store from redis database
 * @param callback
 * @returns {*} - length of store on success
 */
Model.prototype.load = function (callback) {
    if (arguments.length < 1) {
        throw new Error('invalid arguments to load ' + this.name);
    }
    if (!this.connection) {
        return callback(new Error('failed to load ' + this.name + ', because there is no redis connection provided'));
    }
    var self = this;
    this.connection.GET(this.name, function (err, res) {
        if (err) {
            return callback(err);
        }
        try {
            self.store = JSON.parse(res);
        } catch (err) {
            return callback(err);
        }
        callback(null, self.store.length);
    });
};

/**
 * Deletes a store from memory and from the database
 * @param callback
 * @returns {*} - should return '1' on success
 */
Model.prototype.empty = function (callback) {
    if (arguments.length < 1) {
        throw new Error('invalid arguments to empty ' + this.name);
    }
    if (!this.connection) {
        return callback(new Error('failed to empty ' + this.name + ', because there is no redis connection provided'));
    }
    var self = this;
    this.connection.DEL(this.name, function (err, res) {
        if (err) {
            return callback(err);
        }
        self.store = [];
        callback(null, res > 0);
    });
};

/**
 * Module exports
 * @type {Model}
 */
module.exports = Model;
