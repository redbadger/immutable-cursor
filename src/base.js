import {Iterable, Map} from 'immutable';

import {
  listToKeyPath,
  newKeyPath,
  valToKeyPath,
  subCursor,
  updateCursor,
  wrappedValue
} from './utils';

const {Iterator} = Iterable;
const NOT_SET = {}; // Sentinel value

function Base(root, data, keyPath, onChange, size) {
  this.size = size;
  this._root = root || this;
  this._data = data;
  this._keyPath = keyPath;
  this._onChange = onChange;
}

Base.prototype = {
  deref(notSetValue) {
    return this._root._data.getIn(this._keyPath, notSetValue);
  },

  // Need test of noSetValue
  valueOf(notSetValue) {
    return this.deref.call(this, notSetValue);
  },

  get(key, notSetValue) {
    return this.getIn([key], notSetValue);
  },

  getIn(keyPath, notSetValue) {
    const constructKeyPath = listToKeyPath(keyPath);
    if (constructKeyPath.length === 0) {
      return this;
    }
    const value = this._root._data.getIn(newKeyPath(this._keyPath, constructKeyPath), NOT_SET);
    return value === NOT_SET ? notSetValue : wrappedValue(this, constructKeyPath, value);
  },

  set(key, value) {
    if (arguments.length === 1) {
      return updateCursor(this, () => key, []);
    }
    return updateCursor(this, m => m.set(key, value), [key]);
  },

  setIn: Map.prototype.setIn,

  // Needs tests
  remove(key) {
    return updateCursor(this, m  => m.remove(key), [key]);
  },

  // Needs tests
  delete(key) {
    return this.remove.call(this, key);
  },

  deleteIn: Map.prototype.deleteIn,

  removeIn: Map.prototype.deleteIn,

  clear() {
    return updateCursor(this, m => m.clear());
  },

  update(keyOrFn, notSetValue, updater) {
    return do {
      if (arguments.length === 1) {
        updateCursor(this, keyOrFn);
      } else {
        this.updateIn([keyOrFn], notSetValue, updater);
      }
    };
  },

  updateIn(keyPath, notSetValue, updater) {
    return updateCursor(this, m =>
      m.updateIn(keyPath, notSetValue, updater)
      , keyPath);
  },

  merge() {
    return updateCursor(this, m => m.merge.apply(m, arguments));
  },

  mergeWith() {
    return updateCursor(this, m => m.mergeWith.apply(m, arguments));
  },

  mergeIn: Map.prototype.mergeIn,

  mergeDeep() {
    return updateCursor(this, m => m.mergeDeep.apply(m, arguments));
  },

  mergeDeepWith() {
    return updateCursor(this, m => m.mergeDeepWith.apply(m, arguments));
  },

  mergeDeepIn: Map.prototype.mergeDeepIn,

  withMutations(fn) {
    return updateCursor(this, m => (m || Map()).withMutations(fn));
  },

  cursor(path) {
    const subKeyPath = valToKeyPath(path);
    return subKeyPath.length === 0 ? this : subCursor(this, subKeyPath);
  },

  __iterate(fn, reverse) {
    const cursor = this;
    const deref = cursor.deref();
    return do {
      if (deref && deref.__iterate) {
        deref.__iterate((v, k) =>
          fn(wrappedValue(cursor, [k], v), k, cursor),
          reverse
        );
      } else {
        0;
      }
    };
  },

  __iterator(type, reverse) {
    const deref = this.deref();
    const cursor = this;
    const iterator = deref && deref.__iterator &&
deref.__iterator(Iterator.ENTRIES, reverse);
    return new Iterator(() => {
      if (!iterator) {
        return { value: undefined, done: true };
      }
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      const k = entry[0];
      const v = wrappedValue(cursor, [k], entry[1]);
      return {
        value: do {
          if (type === Iterator.KEYS) {
            k;
          } else {
            if (type === Iterator.VALUES) {
              v;
            } else {
              [k, v];
            }
          }
        }
      };
    });
  }
};

export default Base;
