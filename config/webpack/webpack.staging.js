const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

const stagingConfig = {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'window._env_': JSON.stringify({
        KEYCLOAK_CLIENT_ID: 'IPR',
        KEYCLOAK_REALM: 'GSC',
        KEYCLOAK_URL: 'https://keycloakdev01.bcgsc.ca/auth',
        API_BASE_URL: 'https://iprstaging-api.bcgsc.ca/api',
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
        ENDPOINTS: {
          API: 'https://iprstaging-api.bcgsc.ca/api',
          KEYCLOAK: 'https://keycloakdev01.bcgsc.ca/auth',
          GRAPHKB: 'https://graphkbstaging.bcgsc.ca',
          TICKET_CREATION: 'https://www.bcgsc.ca/jira/secure/CreateIssue!default.jspa',
        },
        SSO: {
          REALM: 'GSC',
          CLIENT: 'IPR',
        },
        MISC: {
          MAILTO: 'ipr@bcsgc.ca',
          ENV: 'STAGING',
        },
      }),
    }),
  ],
};
module.exports = [
  merge(common, stagingConfig),
];
