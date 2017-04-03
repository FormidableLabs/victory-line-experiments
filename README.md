VictoryLine Experiments
=======================

Various Webpack configuration hacking for an efficient, terse app bundle with
`VictoryLine` from `victory-charts`.

## Background

Victory builds to ES5 `lib` which is pointed to in `package.json:main` so we
lose tree shaking capabilities until we for reals get to
[ticket #256](https://github.com/FormidableLabs/victory/issues/256). This repo
hacks an approximation use Webpack magic.

Spurred out of a discussion on [victory/#547](https://github.com/FormidableLabs/victory/issues/547)

## The Two Builds

We have two entry points that only differ in:

```js
// use-index.js
// Use the full index with all re-exported components.
import { VictoryLine } from "victory-chart";
```

and

```js
// one-off-import.js
// Go straight off of the full path to the individual component.
import VictoryLine from "victory-chart/components/victory-line/victory-line";
```

## Building

```sh
# Just build
$ yarn run build
$ wc -c dist/*
  272236 dist/one-off-import.js
  423242 dist/use-index.js

# Do custom minification that's actually readable while still doing DCE
# so you can inspect `dist.main.js` to look for tree shaking (`unused` comments).
$ DEMO=true yarn run build
$ $ wc -c dist/*
  970001 dist/one-off-import.js
 1444699 dist/use-index.js

# With bundle analyzer
$ ANALYZE=true yarn run build
```

## Analysis - One Off vs. Using Index

There is a significant different in size:

* one-off-import.js: `272 KB`
* use-index.js: `423 KB`

Diffing a demo build (which is human readable) and some random information:

```sh
$ colordiff -Naur dist/one-off-import.js dist/use-index.js
```

### `victory-core/src/victory-primitives/index.js`

Just picking one example on a quick skim, the `use-index` version exports of the
above file the following additional components not exported by `one-off-import`:

- `Candle`
- `Voronoi`
- `ErrorBar`
- `Point`
- `Bar`
- `Area`
- `Line`

diff:

```
-}, /* 61 */
+}, /* 77 */
 /* exports provided: Area, Bar, Candle, ClipPath, Curve, ErrorBar, Line, Point, Slice, Voronoi, Flyout */
-/* exports used: Curve, Flyout, ClipPath */
+/* exports used: Flyout, ClipPath, Candle, Voronoi, ErrorBar, Point, Bar, Area, Line, Curve */
 /*!*********************************************************!*\
   !*** ../~/victory-core/src/victory-primitives/index.js ***!
   \*********************************************************/

```

Looking just to `Candle` (`victory-core/src/victory-primitives/candle.js`,
index: 200 in `one-off`), there **is** a problem with tree-shaking. Namely, that
even in the one-off version, this code is detected as unused, but we still get
the `require` for it:

```js
__webpack_require__(/*! ./candle */ 200)
```

and the underlying source is present at index `200`.

The `use-index` build has an even greater cascading effect of this problem.

Upon further research, all of this runs up against what appears to be a
long-standing bugs for webpack:

* [webpack/#2867](https://github.com/webpack/webpack/issues/2867):
  `Tree shaking completely broken?`
* [webpack/#1750](https://github.com/webpack/webpack/issues/1750):
  `tree-shaking with lodash-es`

Best synopsis of observed issue so far:
https://github.com/webpack/webpack/issues/1750#issuecomment-251372813

## Sample webpack output

Demo output sample of `use-index.js`:

```sh
Hash: a7d5f3265b3fae48520d
Version: webpack 2.3.2
Time: 15674ms
  Asset     Size  Chunks                    Chunk Names
main.js  1.44 MB       0  [emitted]  [big]  main
   [0] ../~/react/react.js 56 bytes {0} [built]
   [2] ../~/lodash/assign.js 1.57 kB {0} [built]
   [3] ../~/lodash/defaults.js 1.03 kB {0} [built]
   [4] ../~/lodash/isFunction.js 993 bytes {0} [built]
   [6] ../~/lodash/isEqual.js 986 bytes {0} [built]
   [9] ../~/lodash/partialRight.js 1.55 kB {0} [built]
  [12] ../~/lodash/omit.js 1.63 kB {0} [built]
  [47] ../~/victory-chart/src/helpers/axis.js 6.66 kB {0} [built]
  [48] ../~/victory-chart/src/helpers/event-handlers.js 230 bytes {0} [built]
  [49] ../~/victory-chart/src/helpers/wrapper.js 15.3 kB {0} [built]
  [74] ../~/lodash/throttle.js 2.71 kB {0} [built]
  [94] ../~/d3-voronoi/index.js 50 bytes {0} [built]
 [217] ../~/victory-chart/src/index.js 1.89 kB {0} [built]
 [271] ./index.js 397 bytes {0} [built]
 [480] ../~/lodash/groupBy.js 1.4 kB {0} [built]
    + 490 hidden modules

WARNING in main.js from UglifyJs
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__victory_animation_victory_animation__ [main.js:94,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_7__victory_legend_victory_legend__ [main.js:108,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_9__victory_portal_victory_portal__ [main.js:112,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_10__victory_portal_portal__ [main.js:114,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_3__src_cross__ [main.js:892,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_4__src_descending__ [main.js:894,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_5__src_deviation__ [main.js:896,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_6__src_extent__ [main.js:898,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_7__src_histogram__ [main.js:900,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_8__src_threshold_freedmanDiaconis__ [main.js:902,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_9__src_threshold_scott__ [main.js:904,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_10__src_threshold_sturges__ [main.js:906,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_11__src_max__ [main.js:908,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_12__src_mean__ [main.js:910,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_13__src_median__ [main.js:912,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_14__src_merge__ [main.js:914,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_15__src_min__ [main.js:916,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_16__src_pairs__ [main.js:918,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_17__src_permute__ [main.js:920,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_20__src_scan__ [main.js:926,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_21__src_shuffle__ [main.js:928,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_22__src_sum__ [main.js:930,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_24__src_transpose__ [main.js:935,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_25__src_variance__ [main.js:937,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_26__src_zip__ [main.js:939,25]
Condition always false [main.js:1087,4]
Dropping unreachable code [main.js:1088,2]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__src_array__ [main.js:1302,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_2__src_basis__ [main.js:1304,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_3__src_basisClosed__ [main.js:1306,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_4__src_date__ [main.js:1308,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_6__src_object__ [main.js:1312,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_8__src_string__ [main.js:1316,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_9__src_transform_index__ [main.js:1318,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_10__src_zoom__ [main.js:1321,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_11__src_rgb__ [main.js:1323,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_12__src_hsl__ [main.js:1327,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_13__src_lab__ [main.js:1330,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_14__src_hcl__ [main.js:1332,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_16__src_quantize__ [main.js:1338,25]
Condition always false [main.js:1644,6]
Dropping unreachable code [main.js:1645,4]
Declarations in unreachable code! [main.js:1646,6]
Condition always false [main.js:1656,6]
Dropping unreachable code [main.js:1657,4]
Declarations in unreachable code! [main.js:1658,6]
Condition always false [main.js:1671,7]
Dropping side-effect-free statement [main.js:1671,7]
Condition always false [main.js:1685,7]
Dropping side-effect-free statement [main.js:1685,7]
Condition always false [main.js:1730,6]
Dropping unreachable code [main.js:1735,4]
Condition always false [main.js:1820,8]
Dropping unreachable code [main.js:1821,6]
Condition always false [main.js:1837,6]
Dropping unreachable code [main.js:1838,4]
Declarations in unreachable code! [main.js:1840,8]
Side effects in initialization of unused variable self [main.js:1888,6]
Side effects in initialization of unused variable source [main.js:1892,6]
Side effects in initialization of unused variable warning [main.js:1628,4]
Side effects in initialization of unused variable canDefineProperty [main.js:1629,4]
Condition always false [main.js:2379,4]
Dropping unreachable code [main.js:2380,2]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_8__slice__ [main.js:4727,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__src_interval__ [main.js:6011,25]
Condition always false [main.js:6767,4]
Dropping unreachable code [main.js:6768,2]
Condition always false [main.js:7491,103]
Condition always false [main.js:7524,4]
Dropping unreachable code [main.js:7524,11]
Declarations in unreachable code! [main.js:7525,2]
Declarations in unreachable code! [main.js:7539,7]
Side effects in initialization of unused variable canDefineProperty [main.js:7446,4]
Side effects in initialization of unused variable invariant [main.js:7448,4]
Side effects in initialization of unused variable warning [main.js:7449,4]
Condition always false [main.js:7573,6]
Dropping unreachable code [main.js:7573,13]
Declarations in unreachable code! [main.js:7574,4]
Dropping side-effect-free statement [main.js:7619,4]
Dropping side-effect-free statement [main.js:7634,4]
Dropping side-effect-free statement [main.js:7648,4]
Side effects in initialization of unused variable warning [main.js:7570,4]
Condition always false [main.js:9980,8]
Dropping unreachable code [main.js:9981,6]
Side effects in initialization of unused variable bisectLeft [main.js:10103,4]
Dropping unused variable _unused_webpack_default_export [main.js:10250,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__src_locale__ [main.js:10444,25]
Side effects in initialization of unused variable rgbBasis [main.js:10939,4]
Side effects in initialization of unused variable rgbBasisClosed [main.js:10940,4]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__src_locale__ [main.js:12001,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_2__src_isoFormat__ [main.js:12003,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_3__src_isoParse__ [main.js:12005,25]
Side effects in initialization of unused variable formatIso [main.js:12033,4]
Dropping unused variable _unused_webpack_default_export [main.js:12037,40]
Condition always false [main.js:14349,4]
Dropping unreachable code [main.js:14350,2]
Condition always false [main.js:14383,4]
Dropping unreachable code [main.js:14384,2]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__components_victory_chart_victory_chart__ [main.js:14456,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_2__components_victory_axis_victory_axis__ [main.js:14460,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_3__components_victory_area_victory_area__ [main.js:14462,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_4__components_victory_bar_victory_bar__ [main.js:14464,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_5__components_victory_scatter_victory_scatter__ [main.js:14466,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_6__components_victory_group_victory_group__ [main.js:14468,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_7__components_victory_stack_victory_stack__ [main.js:14470,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_8__components_victory_errorbar_victory_errorbar__ [main.js:14472,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_9__components_victory_voronoi_victory_voronoi__ [main.js:14474,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_10__components_victory_voronoi_tooltip_victory_voronoi_tooltip__ [main.js:14476,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_11__components_containers_victory_selection_container__ [main.js:14478,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_12__components_victory_candlestick_victory_candlestick__ [main.js:14480,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_13__components_containers_victory_brush_container__ [main.js:14482,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_14__components_containers_victory_voronoi_container__ [main.js:14484,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_15__components_containers_victory_zoom_container__ [main.js:14486,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_16__components_victory_zoom_victory_zoom__ [main.js:14488,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_17__components_containers_brush_helpers__ [main.js:14490,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_18__components_containers_selection_helpers__ [main.js:14492,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_19__components_containers_voronoi_helpers__ [main.js:14494,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_20__components_containers_zoom_helpers__ [main.js:14496,25]
Dropping unused variable _unused_webpack_default_export [main.js:14701,40]
Dropping unused variable _unused_webpack_default_export [main.js:14813,40]
Dropping unused variable _unused_webpack_default_export [main.js:15059,40]
Dropping unused variable _unused_webpack_default_export [main.js:15244,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:15563,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:16410,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:16805,40]
Dropping unused variable _unused_webpack_default_export [main.js:17296,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:17751,40]
Dropping unused variable _unused_webpack_default_export [main.js:18091,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:18731,40]
Dropping unused variable _unused_webpack_default_export [main.js:19035,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:19353,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:19671,40]
Dropping unused variable _unused_webpack_default_export [main.js:19721,40]
Dropping unused variable _unused_webpack_default_export [main.js:20451,40]
Dropping unused variable _unused_webpack_default_export [main.js:21992,40]
Condition always false [main.js:24023,10]
Dropping unreachable code [main.js:24025,8]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_2_react___default [main.js:23935,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__pairs__ [main.js:24996,25]
Dropping unused variable _unused_webpack_default_export [main.js:24999,40]
Dropping unused variable _unused_webpack_default_export [main.js:25016,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__array__ [main.js:25030,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__bisect__ [main.js:25031,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_2__constant__ [main.js:25032,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_3__extent__ [main.js:25033,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_4__identity__ [main.js:25034,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_5__ticks__ [main.js:25035,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_6__threshold_sturges__ [main.js:25036,25]
Dropping unused variable _unused_webpack_default_export [main.js:25045,40]
Dropping unused variable _unused_webpack_default_export [main.js:25134,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__number__ [main.js:25163,25]
Dropping unused variable _unused_webpack_default_export [main.js:25166,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__ascending__ [main.js:25194,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__number__ [main.js:25195,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_2__quantile__ [main.js:25196,25]
Dropping unused variable _unused_webpack_default_export [main.js:25201,40]
Dropping unused variable _unused_webpack_default_export [main.js:25228,40]
Dropping unused variable _unused_webpack_default_export [main.js:25260,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__ascending__ [main.js:25276,25]
Dropping unused variable _unused_webpack_default_export [main.js:25279,40]
Dropping unused variable _unused_webpack_default_export [main.js:25304,40]
Dropping unused variable _unused_webpack_default_export [main.js:25329,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__array__ [main.js:25356,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__ascending__ [main.js:25357,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_2__number__ [main.js:25358,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_3__quantile__ [main.js:25359,25]
Dropping unused variable _unused_webpack_default_export [main.js:25365,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__deviation__ [main.js:25380,25]
Dropping unused variable _unused_webpack_default_export [main.js:25383,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__transpose__ [main.js:25397,25]
Dropping unused variable _unused_webpack_default_export [main.js:25400,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__src_nest__ [main.js:25415,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__src_set__ [main.js:25417,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_3__src_keys__ [main.js:25421,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_4__src_values__ [main.js:25423,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_5__src_entries__ [main.js:25425,25]
Dropping unused variable _unused_webpack_default_export [main.js:25444,40]
Dropping unused variable _unused_webpack_default_export [main.js:25460,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__map__ [main.js:25476,25]
Dropping unused variable _unused_webpack_default_export [main.js:25479,40]
Dropping unused variable _unused_webpack_default_export [main.js:25600,40]
Dropping unused variable _unused_webpack_default_export [main.js:25612,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:26496,40]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:26531,40]
Side effects in initialization of unused variable hclLong [main.js:26532,4]
Side effects in initialization of unused variable _unused_webpack_default_export [main.js:26566,40]
Side effects in initialization of unused variable hslLong [main.js:26567,4]
Dropping unused function lab [main.js:26585,9]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0_d3_color__ [main.js:26579,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__color__ [main.js:26580,25]
Dropping unused variable _unused_webpack_default_export [main.js:26609,40]
Side effects in initialization of unused variable interpolateTransformCss [main.js:26746,4]
Side effects in initialization of unused variable interpolateTransformSvg [main.js:26747,4]
Side effects in initialization of unused variable rho [main.js:26799,4]
Dropping unused variable _unused_webpack_default_export [main.js:26818,40]
Side effects in initialization of unused variable parseIso [main.js:29323,4]
Dropping unused variable _unused_webpack_default_export [main.js:29327,40]
Side effects in initialization of unused variable days [main.js:29357,4]
Side effects in initialization of unused variable hours [main.js:29389,4]
Side effects in initialization of unused variable milliseconds [main.js:29429,4]
Side effects in initialization of unused variable minutes [main.js:29459,4]
Side effects in initialization of unused variable months [main.js:29488,4]
Side effects in initialization of unused variable seconds [main.js:29518,4]
Side effects in initialization of unused variable utcDays [main.js:29548,4]
Side effects in initialization of unused variable utcHours [main.js:29578,4]
Side effects in initialization of unused variable utcMinutes [main.js:29608,4]
Side effects in initialization of unused variable utcMonths [main.js:29637,4]
Side effects in initialization of unused variable utcSundays [main.js:29688,4]
Side effects in initialization of unused variable utcMondays [main.js:29689,4]
Side effects in initialization of unused variable utcTuesdays [main.js:29690,4]
Side effects in initialization of unused variable utcWednesdays [main.js:29691,4]
Side effects in initialization of unused variable utcThursdays [main.js:29692,4]
Side effects in initialization of unused variable utcFridays [main.js:29693,4]
Side effects in initialization of unused variable utcSaturdays [main.js:29694,4]
Side effects in initialization of unused variable utcYears [main.js:29734,4]
Side effects in initialization of unused variable sundays [main.js:29785,4]
Side effects in initialization of unused variable mondays [main.js:29786,4]
Side effects in initialization of unused variable tuesdays [main.js:29787,4]
Side effects in initialization of unused variable wednesdays [main.js:29788,4]
Side effects in initialization of unused variable thursdays [main.js:29789,4]
Side effects in initialization of unused variable fridays [main.js:29790,4]
Side effects in initialization of unused variable saturdays [main.js:29791,4]
Side effects in initialization of unused variable years [main.js:29831,4]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_1__src_timeout__ [main.js:29848,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_2__src_interval__ [main.js:29850,25]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__timer__ [main.js:29868,25]
Dropping unused variable _unused_webpack_default_export [main.js:29871,40]
Side effects in initialization of unused variable __WEBPACK_IMPORTED_MODULE_0__timer__ [main.js:29893,25]
Dropping unused variable _unused_webpack_default_export [main.js:29896,40]
Condition always false [main.js:34599,34]
Side effects in initialization of unused variable invariant [main.js:34544,4]
Condition always false [main.js:34681,4]
Dropping unreachable code [main.js:34681,11]
Declarations in unreachable code! [main.js:34682,2]
Condition always false [main.js:34690,4]
Dropping unreachable code [main.js:34690,11]
Declarations in unreachable code! [main.js:34691,2]
Side effects in initialization of unused variable warning [main.js:34675,4]
Condition always false [main.js:35294,7]
Dropping side-effect-free statement [main.js:35294,7]
Condition always false [main.js:35304,41]
Condition always false [main.js:35309,78]
Condition always false [main.js:35319,8]
Dropping unreachable code [main.js:35319,15]
Declarations in unreachable code! [main.js:35320,6]
Condition always false [main.js:35329,35]
Condition always false [main.js:35330,41]
Condition always false [main.js:35375,108]
Condition always false [main.js:35386,14]
Dropping unreachable code [main.js:35389,12]
Condition always false [main.js:35410,20]
Condition always false [main.js:35413,21]
Condition always false [main.js:35426,73]
Condition always false [main.js:35430,35]
Condition always false [main.js:35485,6]
Dropping unreachable code [main.js:35485,13]
Declarations in unreachable code! [main.js:35489,4]
Condition always false [main.js:35256,8]
Dropping unreachable code [main.js:35257,6]
Condition always false [main.js:35262,8]
Dropping unreachable code [main.js:35263,6]
Condition always false [main.js:35279,8]
Dropping unreachable code [main.js:35280,6]
Condition always false [main.js:35583,10]
Dropping unreachable code [main.js:35584,8]
Condition always false [main.js:35603,10]
Dropping unreachable code [main.js:35605,8]
Condition always false [main.js:35611,77]
Condition always false [main.js:35628,8]
Dropping unreachable code [main.js:35633,6]
Condition always false [main.js:35641,37]
Condition always false [main.js:35643,8]
Dropping unreachable code [main.js:35644,6]
Side effects in initialization of unused variable ReactPropTypeLocationNames [main.js:34968,4]
Side effects in initialization of unused variable invariant [main.js:34972,4]
Side effects in initialization of unused variable warning [main.js:34973,4]
Condition always false [main.js:35698,4]
Dropping unreachable code [main.js:35698,11]
Declarations in unreachable code! [main.js:35699,2]
Condition always false [main.js:35986,8]
Dropping unreachable code [main.js:35987,6]
Declarations in unreachable code! [main.js:35988,8]
Condition always false [main.js:35980,6]
Dropping unreachable code [main.js:35981,4]
Declarations in unreachable code! [main.js:35981,4]
Condition always false [main.js:36087,5]
Dropping side-effect-free statement [main.js:36087,5]
Condition always false [main.js:36132,5]
Dropping side-effect-free statement [main.js:36132,5]
Side effects in initialization of unused variable warning [main.js:35876,4]
Condition always false [main.js:36437,44]
Side effects in initialization of unused variable invariant [main.js:36420,4]
Condition always false [main.js:36560,12]
Dropping unreachable code [main.js:36560,19]
Declarations in unreachable code! [main.js:36561,10]
Declarations in unreachable code! [main.js:36563,12]
Condition always false [main.js:36583,10]
Dropping unreachable code [main.js:36588,8]
Declarations in unreachable code! [main.js:36589,10]
Condition always false [main.js:36596,15]
Condition always true [main.js:36596,7]
Side effects in initialization of unused variable ReactCurrentOwner [main.js:36467,4]
Side effects in initialization of unused variable invariant [main.js:36471,4]
Side effects in initialization of unused variable warning [main.js:36473,4]
```
