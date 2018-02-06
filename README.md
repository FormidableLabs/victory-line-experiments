VictoryLine Experiments
=======================

Various Webpack configuration hacking for an efficient, terse app bundle with
`VictoryLine` from `victory`.

## Background

Victory builds to ES6 `es` which is pointed to in `package.json:module` so we should get full tree-shaking benefits. But we don't until webpack@4.

Related other tickets:

* [victory#547](https://github.com/FormidableLabs/victory/issues/547):
  Original discussion spurring this repo.
* [victory#549](https://github.com/FormidableLabs/victory/issues/549):
  Webpack tree shaking does not completely remove unused re-exports
* [victory#548](https://github.com/FormidableLabs/victory/issues/548):
  Provide efficient webpack helpers for tree-shaking + DCE

## The Two Builds

We have two entry points that only differ in:

```js
// use-index.js
// Use the full index with all re-exported components.
import { VictoryLine } from "victory";
```

and

```js
// one-off-import.js
// Go straight off of the full path to the individual component.
import VictoryLine from "victory-chart/es/components/victory-line/victory-line";
```

## Building

Here's current for `webpack@3`:

```sh
# Just build
$ yarn run build
$ wc -c dist/*
  296629 dist/one-off-import.js
  460275 dist/use-index.js

# Do custom minification that's actually readable while still doing DCE
# so you can inspect `dist.main.js` to look for tree shaking (`unused` comments).
$ DEMO=true yarn run build
$ $ wc -c dist/*
 1050848 dist/one-off-import.js
 1597913 dist/use-index.js
```

## Analysis - One Off vs. Using Index

There is a significant different in size for `webpack@3`:

* one-off-import.js: `296 KB`
* use-index.js: `460 KB`
