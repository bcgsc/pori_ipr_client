import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import LoginModule from './login/login.module';
import AccessModule from './access/access.module';

angular.module('public', [
  uiRouter,
  LoginModule,
  AccessModule,
]);

export default angular.module('public')
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('public', {
        abstract: true,
      });
  })
  .name;
