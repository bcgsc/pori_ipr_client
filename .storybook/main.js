const custom = require('../config/webpack/webpack.config');

module.exports = {
  stories: [
    "../app/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: (config) => {
    return {
      ...config,
      module: { ...config.module, rules: custom('prod').module.rules },
      resolve: custom('prod').resolve
    };
  },
}
