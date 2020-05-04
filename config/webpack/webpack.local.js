const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const { local } = require('../../env.json');

const localConfig = {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(local),
    }),
  ],
};
module.exports = [
  merge(common, localConfig),
];
