const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

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
  devtool: 'none',
  optimization: {
    usedExports: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      CONFIG: JSON.stringify({
        STORAGE: {
          REFERRER: 'IPR_URI',
          KEYCLOAK: 'PORI_SSO',
          DATABASE_TYPE: 'bcgsc',
        },
        MISC: {
          ENV: 'PRODUCTION',
        },
      }),
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
