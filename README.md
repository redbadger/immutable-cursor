# Immutable Cursor
[![Circle CI](https://circleci.com/gh/redbadger/immutable-cursor.svg?style=svg)](https://circleci.com/gh/redbadger/immutable-cursor)
[![npm version](https://badge.fury.io/js/immutable-cursor.svg)](http://badge.fury.io/js/immutable-cursor)

An isolated fork of immutable.js' cursor with semantics better suited for use with component-centric view layers.

## Rationale

I've always liked [Immutable.js](https://github.com/facebook/immutable-js), but have found their [cursor implementation](https://github.com/facebook/immutable-js/tree/master/contrib/cursor) lacklustre when used in certain contexts. Namely when used in conjunction with a component-centric view layer such as React, due to an [inherent issue](https://github.com/facebook/immutable-js/issues/618) with how it's built. This version fixes that issue.

### How does this affect me?

Due to a conceptual change in how root-level data is shared across every cursor, you can now do:

```js
const data = Immutable.fromJS({a: 1, b: 2});

const cursor = Cursor.from(data, newData => {
  console.log(newData)
});

cursor.set('a', 2);
// Yields Map {"a": 2, "b": 2}

cursor.set('b', 3);
// Yields Map {"a": 2, "b": 3}
// In the former version, this would have yielded Map {"a": 1, "b": 3}, essentially
// 'throwing away' the first result.
```

This has far reaching consequences when used in component-centric view layers such as React. A typical use case
would be to make several derivations of a cursor within a React component before propagating them down the
sub-tree as `props`. Regardless of how many times you split a cursor in this way, they will now **always** reference
the same copy of the root-level atom. This ensures that any update you make will always be on the latest version
of the atom.

## Updates

* Fixed the issue ended up with me forking the cursor implementation
* Removed TypeScript dependency
* Transpiling through Babel
* Generation of browser-based bundle through Webpack
* Added linting using ESLint
* Removed Jest (and Jasmine) from testsuite and replaced with Mocha, Chai and Sinon.

## Relationship with Immutable.js

`immutable-cursor` requires Immutable.js to be included in the runtime. I'm unsure as to the minimum supported version, however, since the cursor is given the `prototype` methods belonging to [`KeyedSeq`](http://facebook.github.io/immutable-js/docs/#/KeyedSeq) and [`IndexedSeq`](http://facebook.github.io/immutable-js/docs/#/IndexedSeq), as long as these types are included in the Immutable.js version, then you should be fine.


## Contributing

1. Fork the repo and create your branch from `master`
2. `npm install`
3. Add tests
4. Build generated JS using `npm run build`
