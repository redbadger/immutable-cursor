import {Seq} from 'immutable';
import Base from './base';

function Keyed (rootData, keyPath, updater, deref, size) {
  Base.call(this, rootData, keyPath, updater, deref, size);
}

Keyed.prototype = Object.create(Seq.Keyed.prototype);
Object.assign(Keyed.prototype, Base.prototype);

Keyed.prototype.toString = function () {
  return this.__toString('Cursor {', '}');
};

export default Keyed;
