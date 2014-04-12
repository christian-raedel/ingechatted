(function() {
  'use strict';

  var crypto = require('crypto'),
      util = require('util'),
      EventEmitter = require('events').EventEmitter;

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
    EventEmitter.call(this);
    this.name = name;
    this.schema = schema || {};
    this.store = [];
    this.debug = require('debug')('model:' + this.name);
    this.debug('created');
  }

  util.inherits(Model, EventEmitter);

  /**
   * Validates an object and adds it to the store
   * @param obj
   * @returns {number} index of item or -1
   */
  Model.prototype.add = function (obj) {
    if (arguments.length !== 1) {
      return -1;
    }
    var field;
    for (field in this.schema) {
      if (this.schema.hasOwnProperty(field) && !obj.hasOwnProperty(field) &&
        this.schema[field].defaultValue) {
        if (this.schema[field].evalDefaultValue) {
          /* jshint -W061 */
          obj[field] = obj[field] || eval(this.schema[field].defaultValue) || null;
        } else {
          obj[field] = obj[field] || this.schema[field].defaultValue;
        }
      }
      if (this.schema.hasOwnProperty(field)) {
        if (this.schema[field].secure) {
          var value = this.secure(obj[field], this.schema[field].secure);
          if (!value) {
            throw new Error(this.schema[field], 500);
          }
          obj[field] = value;
        }
      }
    }
    for (field in obj) {
      if (obj.hasOwnProperty(field)) {
        if (!this.validate(field, obj[field])) {
          return -1;
        }
      }
    }
    this.emit('object-added', obj);
    return this.store.push(obj);
  };

  /**
   * Private method to secure a string value
   * @param value
   * @param type
   * @returns {*}
   */
  Model.prototype.secure = function (value, type) {
    if (arguments.length !== 2 || typeof value !== 'string') {
      return false;
    }
    return crypto.createHash('sha512').update(value).digest('hex');
  };

  /**
   * Private method for validating a field-value pair
   * @param field
   * @param value
   * @returns {boolean} - true on validation success
   */
  Model.prototype.validate = function (field, value) {
    if (arguments.length !== 2) {
      return false;
    }
    var prototype = this.schema[field],
        message = prototype && prototype.name ? prototype.name : field;
    if (!prototype) {
      throw new Error(message, 1000); //field not in schema
    }
    if (prototype.required && !value) {
      throw new Error(message, 1001); //has no value
    }
    if (prototype.type && prototype.type !== typeof value) {
      throw new Error(message, 1002); //wrong type
    }
    if (prototype.unique && this.find(field, value).length > 0) {
      throw new Error(message, 1003); //value has to be unique
    }
    if (prototype.minLength && value.trim().length && value.trim().length < prototype.minLength) {
      throw new Error(message, 1004); //not in range (too short)
    }
    if (prototype.maxLength && value.trim().length && value.trim().length > prototype.maxLength) {
      throw new Error(message, 1005); // not in range (too long)
    }
    return true;
  };

  /**
   * Removes all objects from store, where field-value pair is true
   * @param field
   * @param value
   * @returns {object} removed items count
   */
  Model.prototype.remove = function (field, value) {
    if (arguments.length !== 2) {
      return false;
    }
    var count = 0;
    this.store = this.store.filter(function (item) {
      var remove = item[field] === value;
      if (remove) {
        count++;
      }
      return !remove;
    });
    return count;
  };

  /**
   * Finds a specific field-value combination
   * @param field
   * @param value
   * @return {object} array with found objects
   */
  Model.prototype.find = function (field, value) {
    if (arguments.length !== 2) {
      return [];
    }
    var regex = null;
    if (typeof value === 'string') {
      var r = value.split('/');
      if (r.length === 3) {
        regex = new RegExp(r[1], r[2]);
      }
    }
    return this.store.filter(function (object) {
      if (regex) {
        return object[field].toString().match(regex);
      }
      return object[field] === value;
    });
  };

  /**
   * Sorts the store and returns an array with objects
   * @param field
   * @param order - optional: one of 'ASC' (default) or 'DESC'
   * @returns {object} sorted array
   */
  Model.prototype.sort = function (field, order) {
    if (!field) {
      return [];
    }
    order = order || 'ASC';
    return this.store.sort(function (a, b) {
      if (order.toUpperCase() === 'ASC') {
        return a[field] > b[field];
      } else {
        return a[field] < b[field];
      }
    });
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
      /* jshint node: true */
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
}(this));
