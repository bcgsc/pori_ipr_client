const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const path = require('path');
const common = require('./webpack.config.js');

const prodConfig = (env) => ({
  mode: 'production',
  devtool: 'source-map',
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
      baseUrl: '/',
      minify: {
        removeComments: false,
      },
    }),
    new webpack.DefinePlugin({
      'window._env_': JSON.stringify({
        KEYCLOAK_CLIENT_ID: 'IPR',
        KEYCLOAK_REALM: 'GSC',
        KEYCLOAK_URL: 'https://sso.bcgsc.ca/auth',
        API_BASE_URL: 'https://ipr-api.bcgsc.ca/api',
        GRAPHKB_URL: 'https://graphkb.bcgsc.ca',
        CONTACT_EMAIL: 'ipr@bcgsc.ca',
        CONTACT_TICKET_URL: 'https://www.bcgsc.ca/jira/secure/CreateIssue!default.jspa',
        PUBLIC_PATH: '/',
        IS_DEMO: false,
      }),
      'CONFIG': JSON.stringify({
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
    new CompressionWebpackPlugin({
      algorithm: 'gzip',
    }),
  ],
});

module.exports = (env) => [
  merge(common(env), prodConfig(env)),
];
