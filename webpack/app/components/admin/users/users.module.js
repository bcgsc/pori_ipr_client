import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import UsersComponent from './users.component';

angular.module('admin.users', [
  uiRouter,
]);

export default angular.module('admin.users')
  .component('users', UsersComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('admin.users', {
        url: '/users',
        component: 'users',
      });
  })
  .name;
