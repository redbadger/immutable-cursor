import {Seq} from 'immutable';
import Base from './base';

function Keyed(root, data, keyPath, onChange, size) {
  Base.call(this, root, data, keyPath, onChange, size);
}

Keyed.prototype = Object.create(Seq.Keyed.prototype);
Object.assign(Keyed.prototype, Base.prototype);

Keyed.prototype.toString = function() {
  return this.__toString('Cursor {', '}');
};

export default Keyed;
