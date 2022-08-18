const custom = require('../config/webpack/webpack.config');

module.exports = {
  core: {
    builder: "webpack5",
  },
  stories: [
    "../app/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@react-theming/storybook-addon",
  ],
  webpackFinal: (config) => {
    return {
      ...config,
      module: { ...config.module, rules: custom('prod').module.rules },
      resolve: custom('prod').resolve
    };
  },
}
