'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable = require('immutable');

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function Keyed(root, data, keyPath, onChange, size) {
  _base2['default'].call(this, root, data, keyPath, onChange, size);
}

Keyed.prototype = Object.create(_immutable.Seq.Keyed.prototype);
Object.assign(Keyed.prototype, _base2['default'].prototype);

Keyed.prototype.toString = function () {
  return this.__toString('Cursor {', '}');
};

exports['default'] = Keyed;
module.exports = exports['default'];