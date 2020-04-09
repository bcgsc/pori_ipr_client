import angular from 'angular';
import uiRouter from '@uirouter/angularjs/lib-esm';
import LoginComponent from './login.component';

angular.module('login', [
  uiRouter,
]);

export default angular.module('login')
  .component('login', LoginComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('public.login', {
        url: '/login',
        component: 'login',
      });
  })
  .name;
