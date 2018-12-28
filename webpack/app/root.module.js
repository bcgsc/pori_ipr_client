import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ngMaterial from 'angular-material';
import 'ngstorage';
import 'angular-material/angular-material.css';
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

angular.module('root', [
  uiRouter,
  CommonModule,
  ComponentModule,
  'ngStorage',
  ngMaterial,
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
          'navbar': {
            component: 'navbar',
          },
          'sidebar': {
            component: 'sidebar',
          },
        },
        resolve: {
          /* eslint-disable no-shadow */
          user: ['UserService', async (UserService) => {
            const resp = UserService.me();
            return resp;
          }],
          /* eslint-disable no-shadow */
          isAdmin: ['user', 'UserService', async (user, UserService) => {
            return UserService.isAdmin();
          }],
          /* eslint-disable no-shadow */
          pogs: ['user', 'PogService', async (user, PogService) => {
            return PogService.all();
          }],
          /* eslint-disable no-shadow */
          projects: ['user', 'ProjectService', async (user, ProjectService) => {
            return ProjectService.all();
          }],
          /* eslint-disable no-shadow */
          isExternalMode: ['user', 'AclService', async (user, AclService) => {
            return AclService.isExternalMode();
          }],
        },
      });
  })
  .run(($transitions, $log) => {
    'ngInject';

    $transitions.onStart({ }, async (transition) => {
      $log.log(transition.to().name);
    });
  })
  .config(($httpProvider) => {
    'ngInject';

    // Add Error Interceptors Wrapper
    $httpProvider.interceptors.push(($injector) => {
      'ngInject';

      return {
        request: async (config) => {
          const KeycloakService = $injector.get('KeycloakService');
          if (await KeycloakService.getToken() && !(config.url.match(/https:\/\/lims16.bcgsc.ca.*/g)
            || config.url.match(/https:\/\/www.bcgsc.ca\/jira\/rest\/api\/2/g))) {
            config.headers.Authorization = await KeycloakService.getToken();
          }
          return config;
        },
      };
    });
  })
  .name;
