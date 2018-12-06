import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ComponentsModule from './components/components.module';
import CommonModule from './common/common.module';
import Dashboard from './components/report-listings/dashboard/dashboard.module';
import Navbar from './common/navbar/navbar.module';
import ServiceModule from './services/services.module';
import './root.scss';

const AppModule = angular
  .module('root', [
    ComponentsModule,
    CommonModule,
    ServiceModule,
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
          'navbar@dashboard': {
            component: Navbar,
          },
          // 'adminbar@dashboard': {
          //   templateUrl: 'dashboard/adminbar/adminbar.html',
          //   controller: 'controller.dashboard.adminbar',
          // },
        },
        data: {
          displayName: 'Root',
          breadcrumbProxy: 'root.reports',
        },
        resolve: {
          user: async (UserService, UserSettingsService) => {
            'ngInject';

            const resp = await UserService.me();
            UserSettingsService.init();
            return resp;
          },
          isAdmin: async (UserService, user) => {
            'ngInject';

            return UserService.isAdmin();
          },
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
