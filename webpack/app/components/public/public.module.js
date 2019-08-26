import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import LoginModule from './login/login.module';

angular.module('public', [
  uiRouter,
  LoginModule,
]);

export default angular.module('public')
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('/public', {
        abstract: true,
      });
  })
  .name;
