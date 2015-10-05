'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defineRecordProperties = defineRecordProperties;
exports.makeCursor = makeCursor;
exports.listToKeyPath = listToKeyPath;
exports.newKeyPath = newKeyPath;
exports.valToKeyPath = valToKeyPath;
exports.subCursor = subCursor;
exports.updateCursor = updateCursor;
exports.wrappedValue = wrappedValue;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable = require('immutable');

var _keyed = require('./keyed');

var _keyed2 = _interopRequireDefault(_keyed);

var _indexed = require('./indexed');

var _indexed2 = _interopRequireDefault(_indexed);

function setProp(prototype, name) {
  Object.defineProperty(prototype, name, {
    get: function get() {
      return this.get(name);
    },
    set: function set() {
      if (!this.__ownerID) {
        throw new Error('Cannot set on an immutable record.');
      }
    }
  });
}

function defineRecordProperties(cursor, value) {
  try {
    value._keys.forEach(setProp.bind(undefined, cursor));
  } catch (error) {
    // Object.defineProperty failed. Probably IE8.
  }
}

function makeCursor(root, data, keyPath, onChange, value) {
  if (arguments.length < 5) {
    value = (root ? root._data : data).getIn(keyPath);
  }
  var size = value && value.size;
  var Cursor = _immutable.Iterable.isIndexed(value) ? _indexed2['default'] : _keyed2['default'];
  var cursor = new Cursor(root, data, keyPath, onChange, size);

  if (value instanceof _immutable.Record) {
    defineRecordProperties(cursor, value);
  }

  return cursor;
}

function listToKeyPath(list) {
  return Array.isArray(list) ? list : (0, _immutable.Iterable)(list).toArray();
}

function newKeyPath(head, tail) {
  return head.concat(listToKeyPath(tail));
}

function valToKeyPath(val) {
  return Array.isArray(val) ? val : _immutable.Iterable.isIterable(val) ? val.toArray() : [val];
}

function subCursor(cursor, keyPath, value) {
  if (arguments.length < 3) {
    return makeCursor( // call without value
    cursor._root, null, newKeyPath(cursor._keyPath, keyPath), cursor._onChange);
  }
  return makeCursor(cursor._root, null, newKeyPath(cursor._keyPath, keyPath), cursor._onChange, value);
}

function updateCursor(cursor, changeFn, changeKeyPath) {
  var deepChange = arguments.length > 2;
  var newRootData = cursor._root._data.updateIn(cursor._keyPath, deepChange ? (0, _immutable.Map)() : undefined, changeFn);
  var keyPath = cursor._keyPath || [];
  var result = cursor._onChange && cursor._onChange.call(undefined, newRootData, cursor._root._data, deepChange ? newKeyPath(keyPath, changeKeyPath) : keyPath);
  if (result !== undefined) {
    newRootData = result;
  }

  // Mutate the root data, thus enabling all derived cursors to see the update.
  cursor._root._data = newRootData;

  return makeCursor(cursor._root, null, cursor._keyPath, cursor._onChange);
}

function wrappedValue(cursor, keyPath, value) {
  return _immutable.Iterable.isIterable(value) ? subCursor(cursor, keyPath, value) : value;
}