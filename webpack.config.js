"use strict";

var path = require("path");
var webpack = require("webpack");
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
var LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

// Need to resolve to the **directory** of `src`.
var resolveSrc = function (mod) {
  return path.join( path.dirname(require.resolve(mod + "/package.json")), "src");
};

// Need to babel process both `victory-core` and `victory-chart` and alias.
var victoryCoreSrc = resolveSrc("victory-core");
var victoryChartSrc = resolveSrc("victory-chart");

var IS_DEMO = process.env.DEMO === "true";

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
          victoryCoreSrc,
          victoryChartSrc
        ],
        loader: "babel-loader"
      }
    ]
  },
  resolve: {
    alias: {
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