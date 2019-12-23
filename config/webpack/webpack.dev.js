const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const { development } = require('../../env.json');

const devConfig = {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(development),
    }),
  ],
};
module.exports = [
  merge(common, devConfig),
];
