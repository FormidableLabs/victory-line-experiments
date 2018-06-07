"use strict";

const path = require("path");
const webpack = require("webpack");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

// Entry points.
// **Note**: Need an _array_ of configuration objects with one entry point
// each rather than multiple entry points in one config object per bug:
// https://github.com/webpack/webpack/issues/4453
const ENTRY_POINTS = [
  "one-off-import",
  "use-index"
];

module.exports = [true, false]
  .map((isDev) => ENTRY_POINTS
    .map((name) => ({
      mode: isDev ? "development" : "production",
      context: path.resolve("src"),
      entry: {
        [`${name}${isDev ? "" : ".min"}`]: `./${name}.js`
      },
      output: {
        path: path.resolve("dist"),
        filename: "[name].js",
        pathinfo: true
      },
      optimization: {
        sideEffects: true
      },
      devtool: false,
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
        })
      ]
    }))
  )
  .reduce((m, a) => m.concat(a), []);
