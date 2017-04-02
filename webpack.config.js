"use strict";

var path = require("path");
var webpack = require("webpack");
var LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

// Need to resolve to the **directory** of `src`.
var victoryCoreSrc = path.join(
  path.dirname(require.resolve("victory-core/package.json")),
  "src"
);

module.exports = {
  context: path.resolve("src"),
  entry: {
    main: "./index.js"
  },
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
          victoryCoreSrc
        ],
        loader: "babel-loader"
      }
    ]
  },
  resolve: {
    alias: {
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
      mangle: false,    // DEMO ONLY: Don't change variable names.
      beautify: true,   // DEMO ONLY: Preserve whitespace
      output: {
        comments: true  // DEMO ONLY: Helpful comments
      },
      sourceMap: false
    })
  ]
};