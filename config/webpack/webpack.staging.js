const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

const stagingConfig = {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
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
