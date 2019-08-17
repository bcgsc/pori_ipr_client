import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import UserListComponent from './user-list.component';

angular.module('admin.userList', [
  uiRouter,
]);

export default angular.module('admin.userList')
  .component('userList', UserListComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('admin.userList', {
        url: '/userList',
        component: 'userList',
      });
  })
  .name;
