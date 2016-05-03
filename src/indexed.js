import {Seq} from 'immutable';
import Base from './base';
import {updateCursor} from './utils';

function Indexed(data, keyPath, onChange, size) {
  Base.call(this, data, keyPath, onChange, size);
}

Indexed.prototype = Object.create(Seq.Indexed.prototype);
Object.assign(Indexed.prototype, Base.prototype);

Indexed.prototype.push = function() {
  return updateCursor(this, m => m.push.apply(m, arguments));
};

Indexed.prototype.pop = function() {
  return updateCursor(this, m => m.pop());
};

Indexed.prototype.unshift = function() {
  return updateCursor(this, m => m.unshift.apply(m, arguments));
};

Indexed.prototype.shift = function() {
  return updateCursor(this, m => m.shift());
};

Indexed.prototype.toString = function() {
  return this.__toString('Cursor [', ']');
};

export default Indexed;
