'use strict';

function isObject(obj) {
    return typeof obj === 'object';
}

function extend(src, obj) {
    if (arguments.length !== 2 || !isObject(src) || !isObject(obj)) {
        return null;
    }
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            src[key] = obj[key];
        }
    }
    return src;
}

module.exports = {
    isObject: isObject,
    extend: extend
};
