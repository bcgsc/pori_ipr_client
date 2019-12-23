const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const { staging } = require('../../env.json');

const stagingConfig = {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(staging),
    }),
  ],
};
module.exports = [
  merge(common, stagingConfig),
];
