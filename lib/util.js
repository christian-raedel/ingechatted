(function() {
  'use strict';

  module.exports.isObject = function (obj) {
    return typeof obj === 'object';
  };

  module.exports.extend = function (src, obj) {
    if (arguments.length !== 2 || !isObject(src) || !isObject(obj)) {
      return null;
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        src[key] = obj[key];
      }
    }
    return src;
  };
}(this));
