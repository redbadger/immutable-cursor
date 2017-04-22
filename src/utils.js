import {Iterable, Record, Map} from 'immutable';
import KeyedCursor from './keyed';
import IndexedCursor from './indexed';

function setProp(prototype, name) {
  Object.defineProperty(prototype, name, {
    get: function() {
      return this.get(name);
    },
    set: function() {
      if (!this.__ownerID) {
        throw new Error('Cannot set on an immutable record.');
      }
    }
  });
}

export function defineRecordProperties(cursor, value) {
  try {
    value._keys.forEach(setProp.bind(undefined, cursor));
  } catch (error) {
    // Object.defineProperty failed. Probably IE8.
  }
}

export function makeCursor(rootData, keyPath, store, value) {
  if (arguments.length < 5) {
    value = rootData.getIn(keyPath);
  }
  const size = value && value.size;
  const Cursor = Iterable.isIndexed(value) ? IndexedCursor : KeyedCursor;
  const cursor = new Cursor(rootData, keyPath, store, size);

  if (value instanceof Record) {
    defineRecordProperties(cursor, value);
  }

  return cursor;
}

export function listToKeyPath(list) {
  return Array.isArray(list) ? list : Iterable(list).toArray();
}

export function newKeyPath(head, tail) {
  return head.concat(listToKeyPath(tail));
}

export function valToKeyPath(val) {
  return do {
    if (Array.isArray(val)) {
      val;
    } else {
      if (Iterable.isIterable(val)) {
        val.toArray();
      } else {
        [val];
      }
    }
  };
}

export function subCursor(cursor, keyPath, value) {
  if (arguments.length < 3) {
    return makeCursor( // call without value
      cursor._rootData,
      newKeyPath(cursor._keyPath, keyPath),
      cursor._store
    );
  }
  return makeCursor(
    cursor._rootData,
    newKeyPath(cursor._keyPath, keyPath),
    cursor._store,
    value
  );
}

export function updateCursor(cursor, changeFn) {
  const deepChange = arguments.length > 2;
  const updateFn = oldState => oldState.updateIn(
    cursor._keyPath,
    deepChange ? Map() : undefined,
    changeFn
  );
  return makeCursor(cursor._store.write(updateFn), cursor._keyPath, cursor._store);
}

export function wrappedValue(cursor, keyPath, value) {
  return Iterable.isIterable(value) ? subCursor(cursor, keyPath, value) : value;
}
