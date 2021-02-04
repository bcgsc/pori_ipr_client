const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

const localConfig = {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'window._env_': JSON.stringify({
        KEYCLOAK_CLIENT_ID: 'IPR',
        KEYCLOAK_REALM: 'GSC',
        KEYCLOAK_URL: 'https://keycloakdev01.bcgsc.ca/auth',
        API_BASE_URL: `http://${process.env.HOSTNAME}:8080/api`,
        GRAPHKB_URL: 'https://graphkbstaging.bcgsc.ca',
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
          ENV: 'LOCAL',
        },
      }),
    }),
  ],
};
module.exports = [
  merge(common, localConfig),
];
