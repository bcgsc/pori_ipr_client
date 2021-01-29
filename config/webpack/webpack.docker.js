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
      CONFIG: JSON.stringify({
        STORAGE: {
          REFERRER: 'IPR_URI',
          KEYCLOAK: 'PORI_SSO',
          DATABASE_TYPE: 'bcgsc',
        },
        ENDPOINTS: {
          API: process.env.API_BASE_URL || 'https://ipr-api.bcgsc.ca/api',
          KEYCLOAK: process.env.KEYCLOAK_URL || 'https://sso.bcgsc.ca/auth/',
          GRAPHKB: process.env.GRAPHKB_URL || 'https://graphkb.bcgsc.ca',
          TICKET_CREATION: 'https://www.bcgsc.ca/jira/secure/CreateIssue!default.jspa',
        },
        SSO: {
          REALM: process.env.KEYCLOAK_REALM || 'PORI',
          CLIENT: 'IPR',
        },
        MISC: {
          MAILTO: 'ipr@bcsgc.ca',
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
