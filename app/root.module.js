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
import { react2angular } from 'react2angular';

import ReactBootstrap from './index';
import lazyInjector from './lazyInjector';
import 'ngimport';

import { NavBarComponent } from '@/components/NavBar';
import { SidebarComponent } from '@/components/Sidebar';
import { AnalystCommentsComponent } from '@/views/ReportView/components/AnalystComments';
import { PathwayAnalysisComponent } from '@/views/ReportView/components/PathwayAnalysis';
import { SlidesComponent } from '@/views/ReportView/components/Slides';
import { DiscussionComponent } from '@/views/ReportView/components/Discussion';
import { MicrobialComponent } from '@/views/ReportView/components/Microbial';
import { SmallMutationsComponent } from '@/views/ReportView/components/SmallMutations';
import { CopyNumberComponent } from '@/views/ReportView/components/CopyNumber';
import { StructuralVariantsComponent } from '@/views/ReportView/components/StructuralVariants';
import { SettingsComponent } from '@/views/ReportView/components/Settings';
import { BoardComponent } from '@/views/GermlineView/components/Board';
import { ReportComponent } from '@/views/GermlineView/components/Report';
import { UsersComponent } from '@/views/AdminView/components/Users';
import { GroupsComponent } from '@/views/AdminView/components/Groups';
import { ProjectsComponent } from '@/views/AdminView/components/Projects';

import DiscussionEntryComponent from '@/views/ReportView/components/Discussion/components/DiscussionEntry';
import RoleCardComponent from '@/components/RoleCard';
import PaginateComponent from '@/components/Paginate';
import UsersEditComponent from '@/components/UsersEdit';
import GroupsEditComponent from '@/components/GroupsEdit';
import ProjectsEditComponent from '@/components/ProjectsEdit';
import ReactTable from '@/components/DataTable';
import PageBreak from '@/components/PageBreak';

import '@ag-grid-community/core/dist/styles/ag-grid.min.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.min.css';
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
  .component('analystComments', AnalystCommentsComponent)
  .component('pathwayAnalysis', PathwayAnalysisComponent)
  .component('slides', SlidesComponent)
  .component('discussion', DiscussionComponent)
  .component('discussionEntry', DiscussionEntryComponent)
  .component('microbial', MicrobialComponent)
  .component('smallMutations', SmallMutationsComponent)
  .component('copyNumber', CopyNumberComponent)
  .component('structuralVariants', StructuralVariantsComponent)
  .component('settings', SettingsComponent)
  .component('board', BoardComponent)
  .component('report', ReportComponent)
  .component('users', UsersComponent)
  .component('usersEdit', UsersEditComponent)
  .component('groups', GroupsComponent)
  .component('groupsEdit', GroupsEditComponent)
  .component('projects', ProjectsComponent)
  .component('projectsEdit', ProjectsEditComponent)
  .component('roleCard', RoleCardComponent)
  .component('paginate', PaginateComponent)
  .component('reactTable', react2angular(ReactTable))
  .component('pageBreak', react2angular(PageBreak))
  .config(['$locationProvider', ($locationProvider) => {
    $locationProvider.html5Mode(true);
  }])
  .config(['$mdThemingProvider', ($mdThemingProvider) => {
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
