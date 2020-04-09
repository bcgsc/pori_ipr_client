import angular from 'angular';
import uiRouter from '@uirouter/angularjs/lib-esm';
import AccessComponent from './access.component';

angular.module('access', [
  uiRouter,
]);

export default angular.module('access')
  .component('access', AccessComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('public.access', {
        url: '/access',
        component: 'access',
      });
  })
  .name;
