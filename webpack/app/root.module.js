import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import CommonModule from './common/common.module';
import ComponentModule from './components/components.module';
import RootComponent from './root.component';
import UserService from './services/user.service';
import UserSettingsService from './services/user-settings.service';
import PogService from './services/pog.service';
import ProjectService from './services/project.service';
import AclService from './services/acl.service';
import ReportService from './services/report.service';
import KeycloakService from './services/keycloak.service';
import './root.scss';

angular.module('root', [
  uiRouter,
  CommonModule,
  ComponentModule,
]);

export default angular.module('root')
  .component('root', RootComponent)
  .service('UserService', UserService)
  .service('UserSettingsService', UserSettingsService)
  .service('PogService', PogService)
  .service('ProjectService', ProjectService)
  .service('AclService', AclService)
  .service('ReportService', ReportService)
  .service('KeycloakService', KeycloakService)
  .config(($stateProvider, $urlServiceProvider, $locationProvider) => {
    'ngInject';

    $locationProvider.html5Mode(true);
    // Don't require a perfect URL match (trailing slashes, etc)
    $urlServiceProvider.config.strictMode(false);
    // If no path could be found, send user to 404 error
    $urlServiceProvider.rules.otherwise({ state: 'root.reportlisting.dashboard' });

    $stateProvider
      .state('root', {
        abstract: true,
        url: '/',
        views: {
          '@': {
            component: 'dashboard',
          },
          // 'navbar@root': {
          //   component: 'navbar',
          // },
          // 'adminbar@dashboard': {
          //   templateUrl: 'dashboard/adminbar/adminbar.html',
          //   controller: 'controller.dashboard.adminbar',
          // },
        },
        resolve: {
          /* eslint-disable no-shadow */
          user: ['UserService', async (UserService) => {
            const resp = UserService.me();
            return resp;
          }],
          // /* eslint-disable no-shadow */
          // isAdmin: async (user) => {
          //   return UserService.isAdmin();
          // },
          // /* eslint-disable no-shadow */
          // pogs: async (user) => {
          //   return PogService.all();
          // },
          // /* eslint-disable no-shadow */
          // projects: async (user) => {
          //   return ProjectService.all();
          // },
          // /* eslint-disable no-shadow */
          // isExternalMode: async (user) => {
          //   return AclService.isExternalMode();
          // },
        },
      });
  })
  .run(($transitions) => {
    'ngInject';

    $transitions.onStart({ }, async (transition) => {
      console.log(transition.to().name);
    });
    $transitions.onError({ }, async (transition) => {
      console.log(transition);
    });
  })
  .name;
