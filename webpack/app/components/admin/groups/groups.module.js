import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GroupsComponent from './groups.component';

angular.module('admin.groups', [
  uiRouter,
]);

export default angular.module('admin.groups')
  .component('groups', GroupsComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('admin.groups', {
        url: '/groups',
        component: 'groups',
      });
  })
  .name;
