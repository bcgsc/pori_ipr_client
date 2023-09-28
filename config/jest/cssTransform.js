// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process() {
    // Breaking change from v26 to 28 https://jest-archive-august-2023.netlify.app/docs/28.x/upgrading-to-jest28#transformer
    return {
      code: 'module.exports = {};',
    };
  },
  getCacheKey() {
    // The output is always the same.
    return 'cssTransform';
  },
};
