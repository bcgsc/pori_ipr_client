const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

const localConfig = {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify({
        ATTRS: {
          name: 'LOCAL',
        },
        STORAGE: {
          REFERRER: 'IPR_URI',
          KEYCLOAK: 'BCGSC_SSO',
          DATABASE_TYPE: 'bcgsc',
        },
        ENDPOINTS: {
          API: 'http://adavies02.phage.bcgsc.ca:8080/api',
          KEYCLOAK: 'https://keycloakdev01.bcgsc.ca/auth',
          GRAPHKB: 'https://graphkbstaging.bcgsc.ca',
        },
        SSO: {
          REALM: 'GSC',
          CLIENT: 'IPR',
        },
      }),
    }),
  ],
};
module.exports = [
  merge(common, localConfig),
];
