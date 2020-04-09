import angular from 'angular';
import uiRouter from '@uirouter/angularjs/lib-esm';
import AdminComponent from './admin.component';
import UsersComponent from './users/users.component';
import ProjectsComponent from './projects/projects.component';
import GroupsComponent from './groups/groups.component';
import lazy from './lazy';

angular.module('admin', [
  uiRouter,
]);

export default angular.module('admin')
  .component('admin', AdminComponent)
  .component('users', UsersComponent)
  .component('projects', ProjectsComponent)
  .component('groups', GroupsComponent)
  .config(($stateProvider) => {
    'ngInject';

    Object.values(lazy).forEach(state => $stateProvider.state(state));
  })
  .name;
