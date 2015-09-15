# Immutable Cursor

A fork of immutable.js' cursor with semantics better suited for use with component-centric view layers.

## Rationale

I've always enjoyed using [Immutable.js](https://github.com/facebook/immutable-js), but have found their [cursor implementation](https://github.com/facebook/immutable-js/tree/master/contrib/cursor) lacklustre when used in certain contexts. Namely when used in conjunction with a component-centric view layer such as React, due to an [inherent issue](https://github.com/facebook/immutable-js/issues/618) with how it's built.
