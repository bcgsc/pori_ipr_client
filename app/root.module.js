import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import 'angular-aria';
import 'angular-animate';
import ngSanitize from 'angular-sanitize';
import ngMaterial from 'angular-material';
import ocLazyLoad from 'oclazyload';
import 'ngstorage';
import 'angular-material/angular-material.scss';
import 'angular-sortable-view';
import CommonModule from './components/common.module';
import ComponentModule from './views/components.module';
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
import VariantCountsService from './services/reports/summary/variant-counts.service';
import MutationSummaryService from './services/reports/summary/mutation-summary.service';
import ProbeTargetService from './services/reports/summary/probe-target.service';
import MutationSignatureService from './services/reports/summary/mutation-signature.service';
import MicrobialService from './services/reports/summary/microbial.service';
import PathwayAnalysisService from './services/reports/pathway-analysis/pathway-analysis.service';
import AnalystCommentsService from './services/reports/analyst-comments/analyst-comments.service';
import AlterationService from './services/reports/alteration.service';
import TargetedGenesService from './services/reports/kbmatches/targeted-genes.service';
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
import IndefiniteArticleFilter from './filters/indefinite-article.filter';
import TitleCaseFilter from './filters/titlecase.filter';
import './root.scss';
import './styles/ag-grid.scss';

angular.module('root', [
  uiRouter,
  CommonModule,
  ComponentModule,
  'ngStorage',
  ngMaterial,
  ocLazyLoad,
  ngSanitize,
]);

export default angular.module('root')
  .component('root', RootComponent)
  .service('UserService', UserService)
  .service('PogService', PogService)
  .service('ProjectService', ProjectService)
  .service('AclService', AclService)
  .service('ReportService', ReportService)
  .service('KeycloakService', KeycloakService)
  .service('TumourAnalysisService', TumourAnalysisService)
  .service('PatientInformationService', PatientInformationService)
  .service('GenomicAlterationsService', GenomicAlterationsService)
  .service('VariantCountsService', VariantCountsService)
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
          user: ['UserService', '$state', async (UserService, $state) => {
            try {
              const resp = await UserService.me();
              return resp;
            } catch (err) {
              $state.go('public.login');
              return err;
            }
          }],
          /* eslint-disable no-shadow */
          isAdmin: ['UserService', async UserService => UserService.isAdmin()],
          /* eslint-disable no-shadow */
          pogs: ['PogService', async PogService => PogService.all()],
          /* eslint-disable no-shadow */
          projects: ['ProjectService', async ProjectService => ProjectService.all()],
          /* eslint-disable no-shadow */
          isExternalMode: ['AclService', async AclService => AclService.isExternalMode()],
        },
      });
  })
  .run(($transitions, $log, $rootScope) => {
    'ngInject';

    $transitions.onStart({ }, async (transition) => {
      $rootScope.showLoader = true;
      $log.log(transition.to().name);

      transition.promise.finally(() => {
        $rootScope.showLoader = false;
      });
    });
  })
  .config(($mdThemingProvider) => {
    'ngInject';

    const printGrey = $mdThemingProvider.extendPalette('grey', {
      '50': '#FFFFFF',
    });

    $mdThemingProvider.definePalette('printGrey', printGrey);

    $mdThemingProvider.theme('default')
      .backgroundPalette('printGrey');
  })
  .config(($httpProvider) => {
    'ngInject';

    // Add Error Interceptors Wrapper
    $httpProvider.interceptors.push(($injector) => {
      'ngInject';

      return {
        request: async (config) => {
          const KeycloakService = $injector.get('KeycloakService');
          if (await KeycloakService.getToken()) {
            config.headers.Authorization = await KeycloakService.getToken();
          }
          return config;
        },
      };
    });
  })
  .name;
