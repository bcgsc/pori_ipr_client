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
