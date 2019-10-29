import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

angular.module('print.probe', [
  uiRouter,
]);

export default angular.module('print.probe')
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('print.probe', {
        url: '/probe',
      });
  })
  .name;
