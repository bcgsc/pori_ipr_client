import angular from 'angular';
import 'angular-aria/angular-aria.min';
import 'angular-animate/angular-animate.min';
import 'angular-sanitize/angular-sanitize.min';
import 'angular-material/angular-material.min';
import 'ngstorage';
import 'angular-material/angular-material.min.css';
import 'angular-sortable-view';
import 'angular-file-upload';
import 'ngimport';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { NavBarComponent } from '@/components/NavBar';
import { SidebarComponent } from '@/components/Sidebar';

import ReactBootstrap from './index';
import lazyInjector from './lazyInjector';

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
]);

const rootModule = angular.module('root')
  .component('navBar', NavBarComponent)
  .component('sidebar', SidebarComponent)
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
