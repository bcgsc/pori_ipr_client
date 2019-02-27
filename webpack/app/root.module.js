import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import 'angular-aria';
import 'angular-animate';
import ngSanitize from 'angular-sanitize';
import ngMaterial from 'angular-material';
import 'ngstorage';
import 'angular-material/angular-material.scss';
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
import TumourAnalysisService from './services/report/summary/tumour-analysis.service';
import PatientInformationService from './services/report/summary/patient-information.service';
import GenomicAlterationsService from './services/report/summary/genomic-alterations.service';
import GenomicEventsService from './services/report/summary/genomic-events.service';
import VariantCountsService from './services/report/summary/variant-counts.service';
import MutationSummaryService from './services/report/summary/mutation-summary.service';
import ProbeTargetService from './services/report/summary/probe-target.service';
import MutationSignatureService from './services/report/summary/mutation-signature.service';
import MicrobialService from './services/report/summary/microbial.service';
import AnalystCommentsService from './services/report/analyst-comments/analyst-comments.service';
import TitleCaseFilter from './filters/titlecase.filter';
import './root.scss';

angular.module('root', [
  uiRouter,
  CommonModule,
  ComponentModule,
  'ngStorage',
  ngMaterial,
  ngSanitize,
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
  .service('TumourAnalysisService', TumourAnalysisService)
  .service('PatientInformationService', PatientInformationService)
  .service('GenomicAlterationsService', GenomicAlterationsService)
  .service('GenomicEventsService', GenomicEventsService)
  .service('VariantCountsService', VariantCountsService)
  .service('MutationSummaryService', MutationSummaryService)
  .service('ProbeTargetService', ProbeTargetService)
  .service('MutationSignatureService', MutationSignatureService)
  .service('MicrobialService', MicrobialService)
  .service('AnalystCommentsService', AnalystCommentsService)
  .filter('titlecase', TitleCaseFilter)
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
