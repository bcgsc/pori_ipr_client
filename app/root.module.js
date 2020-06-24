import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import { angular2react } from 'angular2react';
import 'angular-aria/angular-aria.min';
import 'angular-animate/angular-animate.min';
import 'angular-sanitize/angular-sanitize.min';
import 'angular-material/angular-material.min';
import 'ngstorage';
import 'angular-material/angular-material.min.css';
import 'angular-sortable-view';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import ComponentsModule from './components/components.module';
import ViewsModule from './views/views.module';
import RootComponent from './root.component';
import UserService from './services/management/user.service';
import PogService from './services/reports/pog.service';
import ProjectService from './services/management/project.service';
import AclService from './services/management/acl.service';
import ReportService from './services/reports/report.service';
import KeycloakService from './services/management/keycloak.service';
import TumourAnalysisService from './services/reports/summary/tumour-analysis.service';
import PatientInformationService from './services/reports/summary/patient-information.service';
import GenomicAlterationsService from './services/reports/summary/genomic-alterations.service';
import MutationSummaryService from './services/reports/summary/mutation-summary.service';
import ProbeTargetService from './services/reports/summary/probe-target.service';
import MutationSignatureService from './services/reports/summary/mutation-signature.service';
import MicrobialService from './services/reports/summary/microbial.service';
import PathwayAnalysisService from './services/reports/pathway-analysis/pathway-analysis.service';
import AnalystCommentsService from './services/reports/analyst-comments/analyst-comments.service';
import AlterationService from './services/reports/alteration.service';
import TargetedGenesService from './services/reports/probe/targeted-genes.service';
import ProbeSignatureService from './services/reports/probe/signature.service';
import ProbeTestInformationService from './services/reports/probe/test-information.service';
import SlidesService from './services/reports/presentation/slides.service';
import DiscussionService from './services/reports/presentation/discussion.service';
import GroupService from './services/management/group.service';
import KnowledgebaseService from './services/reports/knowledgebase.service';
import TherapeuticService from './services/reports/therapeutic/therapeutic-options.service';
import GermlineService from './services/reports/germline.service';
import ImageService from './services/reports/image.service';
import SmallMutationsService from './services/reports/somatic/small-mutations.service';
import GeneViewerService from './services/reports/somatic/gene-viewer.service';
import CopyNumberAnalysesService from './services/reports/copy-number-analyses/copy-number-analyses.service';
import StructuralVariantService from './services/reports/structural-variants/structural-variants.service';
import MavisService from './services/reports/structural-variants/mavis.service';
import DrugTargetService from './services/reports/expression/drug-target.service';
import OutlierService from './services/reports/expression/outlier.service';
import AppendicesService from './services/reports/appendices/appendices.service';
import GenomicEventsService from './services/reports/summary/genomic-events.service';
import GeneService from './services/reports/probe/gene.service';
import SignatureService from './services/reports/analyst-comments/signature.service';
import IndefiniteArticleFilter from './filters/indefinite-article.filter';
import TitleCaseFilter from './filters/titlecase.filter';
import '@ag-grid-community/core/dist/styles/ag-grid.min.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.min.css';
import './root.scss';
import './styles/ag-grid.scss';
import theme from './styles/_theme.scss';

const AngularjsUiView = { template: '<ui-view></ui-view>' };
let $injector;

angular.module('root', [
  uiRouter,
  ComponentsModule,
  ViewsModule,
  'ngStorage',
  'ngMaterial',
  'ngSanitize',
]);

const rootModule = angular.module('root')
  .component('root', RootComponent)
  .component('uiview', AngularjsUiView)
  .service('UserService', UserService)
  .service('PogService', PogService)
  .service('ProjectService', ProjectService)
  .service('AclService', AclService)
  .service('ReportService', ReportService)
  .service('KeycloakService', KeycloakService)
  .service('TumourAnalysisService', TumourAnalysisService)
  .service('PatientInformationService', PatientInformationService)
  .service('GenomicAlterationsService', GenomicAlterationsService)
  .service('MutationSummaryService', MutationSummaryService)
  .service('ProbeTargetService', ProbeTargetService)
  .service('MutationSignatureService', MutationSignatureService)
  .service('MicrobialService', MicrobialService)
  .service('PathwayAnalysisService', PathwayAnalysisService)
  .service('AnalystCommentsService', AnalystCommentsService)
  .service('SlidesService', SlidesService)
  .service('DiscussionService', DiscussionService)
  .service('GroupService', GroupService)
  .service('KnowledgebaseService', KnowledgebaseService)
  .service('TherapeuticService', TherapeuticService)
  .service('PathwayAnalysisService', PathwayAnalysisService)
  .service('GermlineService', GermlineService)
  .service('AlterationService', AlterationService)
  .service('TargetedGenesService', TargetedGenesService)
  .service('ProbeSignatureService', ProbeSignatureService)
  .service('ProbeTestInformationService', ProbeTestInformationService)
  .service('ImageService', ImageService)
  .service('SmallMutationsService', SmallMutationsService)
  .service('GeneViewerService', GeneViewerService)
  .service('CopyNumberAnalysesService', CopyNumberAnalysesService)
  .service('StructuralVariantsService', StructuralVariantService)
  .service('MavisService', MavisService)
  .service('DrugTargetService', DrugTargetService)
  .service('OutlierService', OutlierService)
  .service('AppendicesService', AppendicesService)
  .service('GenomicEventsService', GenomicEventsService)
  .service('GeneService', GeneService)
  .service('SignatureService', SignatureService)
  .filter('indefiniteArticle', IndefiniteArticleFilter)
  .filter('titlecase', TitleCaseFilter)
  .config(($stateProvider, $urlServiceProvider, $locationProvider) => {
    'ngInject';

    $locationProvider.html5Mode(true);
    // Don't require a perfect URL match (trailing slashes, etc)
    $urlServiceProvider.config.strictMode(false);
    // If no path could be found, send user to 404 error
    $urlServiceProvider.rules.otherwise({ state: 'root.reportlisting.reports' });

    $stateProvider
      .state('root', {
        component: 'root',
        resolve: {
          /* eslint-disable no-shadow */
          user: ['UserService', '$transition$', '$state', async (UserService, $transition$, $state) => {
            try {
              const user = await UserService.me();
              return user;
            } catch (err) {
              $transition$.abort();
              $state.go('public.login');
            }
          }],
          /* eslint-disable no-shadow */
          isAdmin: ['UserService', async (UserService) => {
            try {
              return UserService.isAdmin();
            } catch (err) {
              return false;
            }
          }],
          /* eslint-disable no-shadow */
          projects: ['ProjectService', async (ProjectService) => {
            try {
              return ProjectService.all();
            } catch (err) {
              return [{}];
            }
          }],
          /* eslint-disable no-shadow */
          isExternalMode: ['AclService', async (AclService) => {
            try {
              return AclService.isExternalMode();
            } catch (err) {
              return true;
            }
          }],
        },
      });
  })
  .config(($mdThemingProvider) => {
    'ngInject';

    const printGrey = $mdThemingProvider.extendPalette('grey', {
      50: '#FFFFFF',
    });

    const gscGreen = $mdThemingProvider.extendPalette('green', {
      A200: theme.secondaryMain,
      A700: theme.secondaryLight,
      contrastDefaultColor: 'light',
    });

    const gscBlue = $mdThemingProvider.extendPalette('indigo', {
      default: theme.primaryMain,
      100: theme.primaryLight,
    });

    $mdThemingProvider.definePalette('printGrey', printGrey);
    $mdThemingProvider.definePalette('gscGreen', gscGreen);
    $mdThemingProvider.definePalette('gscBlue', gscBlue);

    $mdThemingProvider.theme('default')
      .primaryPalette('gscBlue')
      .backgroundPalette('printGrey')
      .accentPalette('gscGreen');
  })
  .config(($httpProvider) => {
    'ngInject';

    $httpProvider.interceptors.push(($injector) => {
      'ngInject';

      const accessRegex = /access/gi;

      return {
        request: async (config) => {
          const KeycloakService = $injector.get('KeycloakService');
          const token = await KeycloakService.getToken();
          if (token) {
            config.headers.Authorization = token;
          }
          return config;
        },
        responseError: (response) => {
          switch (response.status) {
            case 403:
              if (response.data.message.match(accessRegex)) {
                const $state = $injector.get('$state');
                $state.go('public.access');
              }
              break;
            default:
              break;
          }
        },
      };
    });
  })
  .run(($transitions, $rootScope, $sessionStorage) => {
    'ngInject';

    $transitions.onStart({ }, async (transition) => {
      $rootScope.showLoader = true;

      transition.promise.finally(() => {
        $rootScope.showLoader = false;
      });
    });

    $transitions.onError({
      to: state => state.name !== 'public.login',
    }, async (transition) => {
      $sessionStorage.returnToState = transition.to().name;
      $sessionStorage.returnParams = transition.params();
    });
  })
  .run(['$injector', (_$injector) => { $injector = _$injector; }])
  .name;

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
]);

angular.bootstrap(document, [rootModule]);

const AngularjsRoot = angular2react('uiview', AngularjsUiView, $injector);
export default AngularjsRoot;
