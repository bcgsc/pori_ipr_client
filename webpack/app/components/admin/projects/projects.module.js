import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ProjectsComponent from './projects.component';

angular.module('admin.projects', [
  uiRouter,
]);

export default angular.module('admin.projects')
  .component('projects', ProjectsComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.admin.projects', {
        url: '/projects',
        component: 'projects',
      });
  })
  .name;
