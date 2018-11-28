/**
 * Sets up the theme to use application wide
 * @param {*} $mdThemingProvider
 * {@link https://material.angularjs.org/1.1.4/api/service/$mdThemingProvider}
 * @return {null} null
 */
function themeConfig($mdThemingProvider) {
  const gscBlueMap = $mdThemingProvider.extendPalette('indigo', {
    '500': 'rgb(38, 50, 140)',
  });
  $mdThemingProvider.definePalette('gscBlue', gscBlueMap);

  $mdThemingProvider.theme('default').primaryPalette('gscBlue');
}

themeConfig.$inject = ['$mdThemingProvider'];

angular
  .module('bcgscIPR')
  .config(themeConfig);
