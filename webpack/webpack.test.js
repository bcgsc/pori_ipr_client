const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const CONFIG = require('./env.json').test;

const testConfig = {
    mode: 'development',
    plugins: [
      new webpack.DefinePlugin({
        CONFIG: JSON.stringify(CONFIG),
      }),
    ],
};
module.exports = [
    merge(common, testConfig),
];