const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.config.js');

const devConfig = (env) => ({
  mode: 'development',
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
        KEYCLOAK_URL: 'https://keycloakdev01.bcgsc.ca/auth',
        API_BASE_URL: 'https://iprdev-api.bcgsc.ca/api',
        GRAPHKB_URL: 'https://graphkbstaging.bcgsc.ca',
        CONTACT_EMAIL: 'ipr@bcgsc.ca',
        CONTACT_TICKET_URL: 'https://www.bcgsc.ca/jira/secure/CreateIssue!default.jspa',
        PUBLIC_PATH: '/',
        IS_DEMO: env ? env.IS_DEMO || false : false,
      }),
      'CONFIG': JSON.stringify({
        STORAGE: {
          REFERRER: 'IPR_URI',
          KEYCLOAK: 'BCGSC_SSO',
          DATABASE_TYPE: 'bcgsc',
        },
        MISC: {
          ENV: 'DEVELOPMENT',
        },
      }),
    }),
  ],
});

module.exports = (env) => [
  merge(common(env), devConfig(env)),
];
