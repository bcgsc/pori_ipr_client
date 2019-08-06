import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import 'angular-aria';
import 'angular-animate';
import ngSanitize from 'angular-sanitize';
import ngMaterial from 'angular-material';
import 'ngstorage';
import 'angular-material/angular-material.scss';
import 'angular-sortable-view';
import CommonModule from './common/common.module';
import ComponentModule from './components/components.module';
import RootComponent from './root.component';
import UserService from './services/user.service';
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
import PathwayAnalysisService from './services/report/pathway-analysis/pathway-analysis.service';
import AnalystCommentsService from './services/report/analyst-comments/analyst-comments.service';
import ProbeAlterationService from './services/report/probe/alteration.service';
import ProbeSignatureService from './services/report/probe/signature.service';
import ProbeTestInformationService from './services/report/probe/test-information.service';
import SlidesService from './services/report/presentation/slides.service';
import DiscussionService from './services/report/presentation/discussion.service';
import AnalysisService from './services/analysis.service';
import GroupService from './services/group.service';
import KnowledgebaseService from './services/knowledgebase.service';
import ChangeHistoryService from './services/change-history.service';
import TherapeuticService from './services/report/therapeutic-options.service';
import PubmedService from './services/pubmed.service';
import GermlineService from './services/germline.service';
import ImageService from './services/report/image.service';
import SmallMutationsService from './services/report/somatic/small-mutations.service';
import GeneViewerService from './services/report/somatic/gene-viewer.service';
import CopyNumberAnalysesService from './services/report/copy-number-analyses/copy-number-analyses.service';
import StructuralVariantService from './services/report/structural-variants/structural-variants.service';
import MavisService from './services/report/structural-variants/mavis.service';
import DrugTargetService from './services/report/expression/drug-target.service';
import OutlierService from './services/report/expression/outlier.service';
import AppendicesService from './services/report/appendices/appendices.service';
import IndefiniteArticleFilter from './filters/indefinite-article.filter';
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
  .service('PathwayAnalysisService', PathwayAnalysisService)
  .service('AnalystCommentsService', AnalystCommentsService)
  .service('SlidesService', SlidesService)
  .service('DiscussionService', DiscussionService)
  .service('AnalysisService', AnalysisService)
  .service('GroupService', GroupService)
  .service('KnowledgebaseService', KnowledgebaseService)
  .service('ChangeHistoryService', ChangeHistoryService)
  .service('TherapeuticService', TherapeuticService)
  .service('PathwayAnalysisService', PathwayAnalysisService)
  .service('PubmedService', PubmedService)
  .service('GermlineService', GermlineService)
  .service('ProbeAlterationService', ProbeAlterationService)
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
  .filter('indefiniteArticle', IndefiniteArticleFilter)
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
        url: '/',
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
