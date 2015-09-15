const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['./src/cursor.js'],
  output: {
    filename: 'cursor.min.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'var',
  },
  externals: {
    // We'll eventually include immutable-js here too, however, until
    // https://github.com/facebook/immutable-js/pull/622 is accepted, we need to
    // package it in this bundle.
    'immutable': 'immutable'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
};
