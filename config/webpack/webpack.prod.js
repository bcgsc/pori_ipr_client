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
      'window._env_': JSON.stringify({
        KEYCLOAK_CLIENT_ID: 'IPR',
        KEYCLOAK_REALM: 'GSC',
        KEYCLOAK_URL: 'https://sso.bcgsc.ca/auth',
        API_BASE_URL: 'https://ipr-api.bcgsc.ca/api',
        GRAPHKB_URL: 'https://graphkb.bcgsc.ca',
        CONTACT_EMAIL: 'ipr@bcgsc.ca',
        CONTACT_TICKET_URL: 'https://www.bcgsc.ca/jira/secure/CreateIssue!default.jspa',
      }),
      CONFIG: JSON.stringify({
        STORAGE: {
          REFERRER: 'IPR_URI',
          KEYCLOAK: 'BCGSC_SSO',
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
