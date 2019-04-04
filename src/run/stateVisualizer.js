/**
 * Sets up the router visualizer to see state changes
 * @param {*} $uiRouter - Router instance
 * @param {*} $window {@link https://docs.angularjs.org/api/ng/service/$window}
 * @return {null} null
 */
const stateVisualizer = ($uiRouter, $window) => {
  if ((CONFIG.ATTRS.name) === 'LOCAL') {
    const Visualizer = $window['@uirouter/visualizer'].Visualizer;
    $uiRouter.plugin(Visualizer);
  }
};

stateVisualizer.$inject = ['$uiRouter', '$window'];

angular
  .module('bcgscIPR')
  .run(stateVisualizer);
