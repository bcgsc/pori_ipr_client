import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ComponentsModule from './components/components.module';
import CommonModule from './common/common.module';
import Dashboard from './components/report-listings/dashboard/dashboard.module';
import './root.scss';

const AppModule = angular
  .module('root', [
    ComponentsModule,
    CommonModule,
    uiRouter,
  ])
  .config(($stateProvider, $locationProvider) => {
    'ngInject';

    $locationProvider.html5Mode(true);

    $stateProvider
      .state('root', {
        abstract: true,
        views: {
          '@': {
            component: Dashboard,
          },
          'toolbar@dashboard': {
            templateUrl: 'dashboard/toolbar.html',
            controller: 'controller.dashboard.toolbar',
          },
          'adminbar@dashboard': {
            templateUrl: 'dashboard/adminbar/adminbar.html',
            controller: 'controller.dashboard.adminbar',
          },
        },
        data: {
          displayName: 'Dashboard',
          breadcrumbProxy: 'dashboard.reports',
        },
        resolve: {
          user: ['api.user', '$userSettings', async ($user, $userSettings) => {
            'ngInject';

            const resp = await $user.me();
            $userSettings.init();
            return resp;
          }],
          isAdmin: ['api.user', 'user', async ($user, user) => {
            'ngInject';

            return $user.isAdmin();
          }],
          pogs: ['api.pog', 'user', async ($pog, user) => {
            'ngInject';

            return $pog.all();
          }],
          projects: ['api.project', 'user', async ($project, user) => {
            'ngInject';

            return $project.all();
          }],
          isExternalMode: ['$acl', 'user', async ($acl, user) => {
            'ngInject';

            return $acl.isExternalMode();
          }],
        },
      });
  })
  .name;

export default AppModule;
