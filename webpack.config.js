"use strict";

var path = require("path");
var webpack = require("webpack");
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

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
    rules: [{
      test: /\.js$/,
      loader: "babel-loader",
      include: [
        /node_modules\/victory-core/,
        /node_modules\/victory-chart/,
        path.resolve("./src"),
      ],
    }]
  },
  resolve: {
    alias: {
      "victory-core": require.resolve("victory-core/src")
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
    }),
    new BundleAnalyzerPlugin()
  ]
};