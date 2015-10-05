'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable = require('immutable');

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _utils = require('./utils');

function Indexed(root, data, keyPath, onChange, size) {
  _base2['default'].call(this, root, data, keyPath, onChange, size);
}

Indexed.prototype = Object.create(_immutable.Seq.Indexed.prototype);
Object.assign(Indexed.prototype, _base2['default'].prototype);

Indexed.prototype.push = function () {
  var _arguments = arguments;

  return (0, _utils.updateCursor)(this, function (m) {
    return m.push.apply(m, _arguments);
  });
};

Indexed.prototype.pop = function () {
  return (0, _utils.updateCursor)(this, function (m) {
    return m.pop();
  });
};

Indexed.prototype.unshift = function () {
  var _arguments2 = arguments;

  return (0, _utils.updateCursor)(this, function (m) {
    return m.unshift.apply(m, _arguments2);
  });
};

Indexed.prototype.shift = function () {
  return (0, _utils.updateCursor)(this, function (m) {
    return m.shift();
  });
};

Indexed.prototype.toString = function () {
  return this.__toString('Cursor [', ']');
};

exports['default'] = Indexed;
module.exports = exports['default'];