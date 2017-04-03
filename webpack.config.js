"use strict";

var path = require("path");
var webpack = require("webpack");
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
var LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

// Need to resolve to the **directory** of `src`.
//
// Use heuristic of knowing `package.json` _must_ be at a predictable root
// location.
var resolveSrc = function (mod) {
  return path.join(path.dirname(require.resolve(mod + "/package.json")), "src");
};

// Need to babel process both `victory-core` and `victory-chart` and alias.
var victoryCoreSrc = resolveSrc("victory-core");
var victoryChartSrc = resolveSrc("victory-chart");

var IS_DEMO = process.env.DEMO === "true";

// Entry points.
// **Note**: Need an _array_ of configuration objects with one entry point
// each rather than multiple entry points in one config object per bug:
// https://github.com/webpack/webpack/issues/4453
var ENTRY_POINTS = [
  "one-off-import",
  "use-index"
];

module.exports = ENTRY_POINTS.map(function (name) {
  var entry = {};
  entry[name] = "./" + name + ".js";

  return {
    context: path.resolve("src"),
    entry: entry,
    output: {
      path: path.resolve("dist"),
      filename: "[name].js",
      pathinfo: true
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          include: [
            path.resolve("src"),
            // Babel parse the victory sources.
            victoryCoreSrc,
            victoryChartSrc
          ],
          loader: "babel-loader"
        }
      ]
    },
    resolve: {
      alias: {
        // Force use of es6 src instead of es5 lib
        "victory-chart": victoryChartSrc,
        "victory-core": victoryCoreSrc
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify("production"),
        }
      }),
      new LodashModuleReplacementPlugin({
        "currying": true,
        "flattening": true,
        "paths": true,
        "placeholders": true,
        "shorthands": true
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: true,
        mangle: !IS_DEMO,    // DEMO ONLY: Don't change variable names.
        beautify: IS_DEMO,   // DEMO ONLY: Preserve whitespace
        output: {
          comments: IS_DEMO  // DEMO ONLY: Helpful comments
        },
        sourceMap: false
      })
    ].concat(
      process.env.ANALYZE === "true" ? new BundleAnalyzerPlugin() : []
    )
  };
});
