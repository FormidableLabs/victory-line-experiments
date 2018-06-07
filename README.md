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

Here's current for `webpack@4`:

```sh
# Just build
$ yarn run build

# production
$ wc -c dist/*{index,import}.min.js
  248226 dist/use-index.min.js
  248232 dist/one-off-import.min.js

# development (with sideEffects optimizations on.)
$ wc -c dist/*{index,import}.js
  888503 dist/use-index.js
  888676 dist/one-off-import.js

```

## Analysis - One Off vs. Using Index

Everything's the same. Yay!
