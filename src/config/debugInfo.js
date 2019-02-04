/**
 * Config to disable debug mode in local env
 * @param {*} $compileProvider {@link https://docs.angularjs.org/api/ng/provider/$compileProvider}
 * @return {null} null
 */
function debugInfo($compileProvider) {
  if ((CONFIG.ATTRS.name) !== 'LOCAL') {
    $compileProvider.debugInfoEnabled(false);
  }
}

debugInfo.$inject = ['$compileProvider'];

angular
  .module('bcgscIPR')
  .config(debugInfo);
