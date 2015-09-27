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

export function makeCursor(root, data, keyPath, onChange, value) {
  if (arguments.length < 5) {
    value = (root ? root._data : data).getIn(keyPath);
  }
  const size = value && value.size;
  const Cursor = Iterable.isIndexed(value) ? IndexedCursor : KeyedCursor;
  const cursor = new Cursor(root, data, keyPath, onChange, size);

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
      cursor._root,
      null,
      newKeyPath(cursor._keyPath, keyPath),
      cursor._onChange
    );
  }
  return makeCursor(
    cursor._root,
    null,
    newKeyPath(cursor._keyPath, keyPath),
    cursor._onChange,
    value
  );
}

export function updateCursor(cursor, changeFn, changeKeyPath) {
  const deepChange = arguments.length > 2;
  let newRootData = cursor._root._data.updateIn(
    cursor._keyPath,
    deepChange ? Map() : undefined,
    changeFn
  );
  const keyPath = cursor._keyPath || [];
  const result = cursor._onChange && cursor._onChange.call(
    undefined,
    newRootData,
    cursor._root._data,
    deepChange ? newKeyPath(keyPath, changeKeyPath) : keyPath
  );
  if (result !== undefined) {
    newRootData = result;
  }

  // Mutate the root data, thus enabling all derived cursors to see the update.
  cursor._root._data = newRootData;

  return makeCursor(cursor._root, null, cursor._keyPath, cursor._onChange);
}

export function wrappedValue(cursor, keyPath, value) {
  return Iterable.isIterable(value) ? subCursor(cursor, keyPath, value) : value;
}
