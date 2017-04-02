VictoryLine Experiments
=======================

Various Webpack configuration hacking for an efficient, terse app bundle with
`VictoryLine` from `victory-charts`.

## Background

Victory builds to ES5 `lib` which is pointed to in `package.json:main` so we
lose tree shaking capabilities until we for reals get to
[ticket #256](https://github.com/FormidableLabs/victory/issues/256). This repo
hacks an approximation use Webpack magic.

## Building

**Status**: _Broken_

```sh
$ yarn run build
...

ERROR in ../~/victory-chart/src/components/victory-axis/victory-axis.js
Module parse failed: /Users/rye/scm/fmd/victory-line-experiments/node_modules/victory-chart/src/components/victory-axis/victory-axis.js Unexpected token (22:21)
You may need an appropriate loader to handle this file type.
|
| class VictoryAxis extends React.Component {
|   static displayName = "VictoryAxis";
|
|   static role = "axis";
 @ ../~/victory-chart/src/index.js 3:0-80
 @ ./index.js

...
```
