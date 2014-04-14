(function(sandbox) {
  'use strict';

  sandbox.angular.module('client.services.Model', [])
    .factory('Model', ModelFactory);

  function ModelFactory() {

    /**
     * Constructs a new model instance with given name, schema and optional redis connection.
     * @param name
     * @param schema - arguments for all 'required' fields are 'type', 'unique', 'minLength' and 'maxLength'
     * @constructor
     */
    function Model(name, schema) {
      if (arguments.length < 1) {
        throw new Error('invalid arguments to construct a model');
      }
      this.name = name;
      this.schema = schema || {};
      this.store = [];
      this.debug = function () {
        var args = [].splice.call(arguments, 0);
        console.debug('model: ' + this.name, args);
      };
      this.debug('created');
    }

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
      }
      for (field in obj) {
        if (obj.hasOwnProperty(field)) {
          if (!this.validate(field, obj[field])) {
            return -1;
          }
        }
      }
      return this.store.push(obj);
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
     * @returns {*} - 'true' on success
     */
    Model.prototype.save = function () {
      throw new Error('not implemented yet');
    };

    /**
     * Loads a store from redis database
     * @returns {*} - length of store on success
     */
    Model.prototype.load = function () {
      throw new Error('not implemented yet');
    };

    /**
     * Deletes a store from memory and from the database
     * @returns {*} - should return '1' on success
     */
    Model.prototype.empty = function () {
      throw new Error('not implemented yet');
    };

    return Model;
  }
}(this));
