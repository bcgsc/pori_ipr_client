import angular from 'angular';
import 'angular-aria/angular-aria.min';
import 'angular-animate/angular-animate.min';
import 'angular-sanitize/angular-sanitize.min';
import 'angular-material/angular-material.min';
import 'ngstorage';
import 'angular-material/angular-material.min.css';
import 'angular-sortable-view';
import 'angular-file-upload';
import 'ng-quill';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import ReactBootstrap from './index';
import lazyInjector from './lazyInjector';
import 'ngimport';

import { NavBarComponent } from '@/components/NavBar';
import { SidebarComponent } from '@/components/Sidebar';
import { GenomicSummaryComponent } from '@/views/ReportView/components/GenomicSummary';
import { AnalystCommentsComponent } from '@/views/ReportView/components/AnalystComments';
import { PathwayAnalysisComponent } from '@/views/ReportView/components/PathwayAnalysis';
import { SlidesComponent } from '@/views/ReportView/components/Slides';
import { DiscussionComponent } from '@/views/ReportView/components/Discussion';

import MutationSignatureComponent from '@/components/MutationSignature';
import DiscussionEntryComponent from '@/views/ReportView/components/Discussion/components/DiscussionEntry';

import PogService from './services/reports/pog.service';
import ProjectService from './services/management/project.service';
import AclService from './services/management/acl.service';
import ReportService from './services/reports/report.service';
import TumourAnalysisService from './services/reports/summary/tumour-analysis.service';
import PatientInformationService from './services/reports/summary/patient-information.service';
import GenomicAlterationsService from './services/reports/summary/genomic-alterations.service';
import MutationSummaryService from './services/reports/summary/mutation-summary.service';
import ProbeTargetService from './services/reports/summary/probe-target.service';
import MutationSignatureService from './services/reports/summary/mutation-signature.service';
import MicrobialService from './services/reports/summary/microbial.service';
import AnalystCommentsService from './services/reports/analyst-comments/analyst-comments.service';
import AlterationService from './services/reports/alteration.service';
import ProbeSignatureService from './services/reports/probe/signature.service';
import ProbeTestInformationService from './services/reports/probe/test-information.service';
import GroupService from './services/management/group.service';
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
import IndefiniteArticleFilter from './filters/indefinite-article.filter';
import TitleCaseFilter from './filters/titlecase.filter';
import '@ag-grid-community/core/dist/styles/ag-grid.min.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.min.css';
// import './root.scss';
import './styles/ag-grid.scss';
import theme from './styles/_theme.scss';

angular.module('root', [
  'ngStorage',
  'ngMaterial',
  'ngSanitize',
  'angularFileUpload',
  'bcherny/ngimport',
  'ngQuill',
]);

const rootModule = angular.module('root')
  .component('navBar', NavBarComponent)
  .component('sidebar', SidebarComponent)
  .component('genomicSummary', GenomicSummaryComponent)
  .component('analystComments', AnalystCommentsComponent)
  .component('pathwayAnalysis', PathwayAnalysisComponent)
  .component('mutationSignature', MutationSignatureComponent)
  .component('slides', SlidesComponent)
  .component('discussion', DiscussionComponent)
  .component('discussionEntry', DiscussionEntryComponent)
  .service('PogService', PogService)
  .service('ProjectService', ProjectService)
  .service('AclService', AclService)
  .service('ReportService', ReportService)
  .service('TumourAnalysisService', TumourAnalysisService)
  .service('PatientInformationService', PatientInformationService)
  .service('GenomicAlterationsService', GenomicAlterationsService)
  .service('MutationSummaryService', MutationSummaryService)
  .service('ProbeTargetService', ProbeTargetService)
  .service('MutationSignatureService', MutationSignatureService)
  .service('MicrobialService', MicrobialService)
  .service('AnalystCommentsService', AnalystCommentsService)
  .service('GroupService', GroupService)
  .service('TherapeuticService', TherapeuticService)
  .service('GermlineService', GermlineService)
  .service('AlterationService', AlterationService)
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
  .filter('indefiniteArticle', IndefiniteArticleFilter)
  .filter('titlecase', TitleCaseFilter)
  .config(['$locationProvider', ($locationProvider) => {
    'ngInject';

    $locationProvider.html5Mode(true);
  }])
  .config(['$mdThemingProvider', ($mdThemingProvider) => {
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
  }])
  .run(['$injector', ($injector) => {
    lazyInjector.$injector = $injector;
    ReactBootstrap();
  }])
  .name;

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
]);

angular.bootstrap(document.createElement('div'), [rootModule], { strictDi: true });
