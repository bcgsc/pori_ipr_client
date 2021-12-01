const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const common = require('./webpack.config.js');

const prodConfig = (env) => ({
  mode: 'production',
  devtool: undefined,
  optimization: {
    usedExports: true,
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../../app/index.ejs'),
      inject: true,
      baseUrl: '%PUBLIC_PATH%',
      minify: {
        removeComments: false,
      },
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'CONFIG': JSON.stringify({
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
  ],
});

module.exports = (env) => [
  merge(common(env), prodConfig(env)),
];
