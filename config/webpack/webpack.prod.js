const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const { production } = require('../../env.json');

const prodConfig = {
  module: {
    rules: [
      {
        test: /angular\.min\.js$/,
        loader: 'exports-loader?angular',
      },
    ],
  },
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(production),
    }),
    new OptimizeCSSAssetsPlugin({}),
  ],
  resolve: {
    alias: {
      angular: 'angular/angular.min.js',
    },
  },
};
module.exports = [
  merge(common, prodConfig),
];
