"use strict";

var path = require("path");
var webpack = require("webpack");
var LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");

var IS_DEMO = process.env.DEMO === "true";

// Entry points.
// **Note**: Need an _array_ of configuration objects with one entry point
// each rather than multiple entry points in one config object per bug:
// https://github.com/webpack/webpack/issues/4453
var ENTRY_POINTS = [
  "one-off-import",
  "use-index"
];

module.exports = ENTRY_POINTS.map((name) => ({
  mode: IS_DEMO ? "development" : "production",
  context: path.resolve("src"),
  entry: {
    [name]: "./" + name + ".js"
  },
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
    pathinfo: true
  },
  devtool: false,
  optimization: {
    sideEffects: true
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
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: true,
        mangle: !IS_DEMO,       // DEMO ONLY: Don't change variable names.
        beautify: IS_DEMO,      // DEMO ONLY: Preserve whitespace
        output: {
          comments: IS_DEMO     // DEMO ONLY: Helpful comments
        }
      },
      sourceMap: false
    })
  ]
}));
