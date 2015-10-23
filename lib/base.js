'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _immutable = require('immutable');

var _utils = require('./utils');

var Iterator = _immutable.Iterable.Iterator;

var NOT_SET = {}; // Sentinel value

function Base(root, data, keyPath, onChange, size) {
  this.size = size;
  this._root = root || this;
  this._data = data;
  this._keyPath = keyPath;
  this._onChange = onChange;
}

Base.prototype = {
  deref: function deref(notSetValue) {
    return this._root._data.getIn(this._keyPath, notSetValue);
  },

  // Need test of noSetValue
  valueOf: function valueOf(notSetValue) {
    return this.deref.call(this, notSetValue);
  },

  get: function get(key, notSetValue) {
    return this.getIn([key], notSetValue);
  },

  getIn: function getIn(keyPath, notSetValue) {
    var constructKeyPath = (0, _utils.listToKeyPath)(keyPath);
    if (constructKeyPath.length === 0) {
      return this;
    }
    var value = this._root._data.getIn((0, _utils.newKeyPath)(this._keyPath, constructKeyPath), NOT_SET);
    return value === NOT_SET ? notSetValue : (0, _utils.wrappedValue)(this, constructKeyPath, value);
  },

  set: function set(key, value) {
    if (arguments.length === 1) {
      return (0, _utils.updateCursor)(this, function () {
        return key;
      }, []);
    }
    return (0, _utils.updateCursor)(this, function (m) {
      return m.set(key, value);
    }, [key]);
  },

  setIn: _immutable.Map.prototype.setIn,

  // Needs tests
  remove: function remove(key) {
    return (0, _utils.updateCursor)(this, function (m) {
      return m.remove(key);
    }, [key]);
  },

  // Needs tests
  'delete': function _delete(key) {
    return this.remove.call(this, key);
  },

  deleteIn: _immutable.Map.prototype.deleteIn,

  removeIn: _immutable.Map.prototype.deleteIn,

  clear: function clear() {
    return (0, _utils.updateCursor)(this, function (m) {
      return m.clear();
    });
  },

  update: function update(keyOrFn, notSetValue, updater) {
    return arguments.length === 1 ? (0, _utils.updateCursor)(this, keyOrFn) : this.updateIn([keyOrFn], notSetValue, updater);
  },

  updateIn: function updateIn(keyPath, notSetValue, updater) {
    return (0, _utils.updateCursor)(this, function (m) {
      return m.updateIn(keyPath, notSetValue, updater);
    }, keyPath);
  },

  merge: function merge() {
    var _arguments = arguments;

    return (0, _utils.updateCursor)(this, function (m) {
      return m.merge.apply(m, _arguments);
    });
  },

  mergeWith: function mergeWith() {
    var _arguments2 = arguments;

    return (0, _utils.updateCursor)(this, function (m) {
      return m.mergeWith.apply(m, _arguments2);
    });
  },

  mergeIn: _immutable.Map.prototype.mergeIn,

  mergeDeep: function mergeDeep() {
    var _arguments3 = arguments;

    return (0, _utils.updateCursor)(this, function (m) {
      return m.mergeDeep.apply(m, _arguments3);
    });
  },

  mergeDeepWith: function mergeDeepWith() {
    var _arguments4 = arguments;

    return (0, _utils.updateCursor)(this, function (m) {
      return m.mergeDeepWith.apply(m, _arguments4);
    });
  },

  mergeDeepIn: _immutable.Map.prototype.mergeDeepIn,

  withMutations: function withMutations(fn) {
    return (0, _utils.updateCursor)(this, function (m) {
      return (m || (0, _immutable.Map)()).withMutations(fn);
    });
  },

  cursor: function cursor(path) {
    var subKeyPath = (0, _utils.valToKeyPath)(path);
    return subKeyPath.length === 0 ? this : (0, _utils.subCursor)(this, subKeyPath);
  },

  __iterate: function __iterate(fn, reverse) {
    var cursor = this;
    var deref = cursor.deref();
    return deref && deref.__iterate ? deref.__iterate(function (v, k) {
      return fn((0, _utils.wrappedValue)(cursor, [k], v), k, cursor);
    }, reverse) : 0;
  },

  __iterator: function __iterator(type, reverse) {
    var deref = this.deref();
    var cursor = this;
    var iterator = deref && deref.__iterator && deref.__iterator(Iterator.ENTRIES, reverse);
    return new Iterator(function () {
      if (!iterator) {
        return { value: undefined, done: true };
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = (0, _utils.wrappedValue)(cursor, [k], entry[1]);
      return {
        value: type === Iterator.KEYS ? k : type === Iterator.VALUES ? v : [k, v]
      };
    });
  }
};

exports['default'] = Base;
module.exports = exports['default'];