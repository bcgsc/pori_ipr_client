const custom = require('../config/webpack/webpack.config');

module.exports = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  stories: [
    "../app/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
  ],
  core: {
    // Storybook 8.6+ rejects any request whose Host header isn't localhost or a
    // raw IP ("Invalid host", 403). Dev servers here run on named GSC hosts, so
    // allow that domain (leading dot = suffix match) rather than opening it up
    // with `true`.
    allowedHosts: ['.bcgsc.ca'],
  },
  webpackFinal: (config) => {
    const customConfig = custom('prod');
    return {
      ...config,
      module: {
        ...config.module,
        rules: customConfig.module.rules,
      },
      resolve: {
        ...config.resolve,
        ...customConfig.resolve,
        alias: {
          ...config.resolve?.alias,
          ...customConfig.resolve.alias,
        },
      },
    };
  },
}
