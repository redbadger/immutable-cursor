# Immutable Cursor
[![Circle CI](https://circleci.com/gh/redbadger/immutable-cursor.svg?style=svg)](https://circleci.com/gh/redbadger/immutable-cursor)
[![npm version](https://badge.fury.io/js/immutable-cursor.svg)](http://badge.fury.io/js/immutable-cursor)

> Immutable cursors incorporating the [Immutable.js](https://github.com/facebook/immutable-js) API interface over a Clojure-inspired atom

## Rationale

In Immutable.js' [cursor implementation](https://github.com/facebook/immutable-js/tree/master/contrib/cursor), all applicable parts of it's [native interface](https://facebook.github.io/immutable-js/docs) are exposed as first-class citizens directly on the cursor, allowing for a rich mutative API.

Each cursor however, holds it's *own* reference to the root state, which quickly leads to issues with the integrity of the root state when updates are made from derived cursors - i.e not included in a chained sequence with the root cursor.

### Solution

A Clojure-inspired atom is placed above the cursor composition, and is the only point of mutation in the entire system. Each cursor references this atom, which ensures that an accurate state representation **always** flows down the system.

```js
const data = Immutable.fromJS({a: 1, b: 2});

const cursor = Cursor.from(data, newData => {
  console.log(newData)
});

cursor.set('a', 2);
cursor.set('b', 3);
// $> Map {"a": 2, "b": 3}
```

This has far reaching consequences when used in component-centric view layers such as React. A typical use case
would be to make several derivations of a cursor within a React component before propagating them down the
sub-tree as `props`.

## Contributing

1. Fork the repo and create your branch from `master`
2. `npm install`
3. Add tests
4. Commit the aforementioned and associated source files. **NOTE** There is no need to manually create the generated `dist` files; this, a test run and a linting pass is done automatically every time you make a commit.
