import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DashboardComponent from './dashboard.component';
import ReportService from '../../../services/report.service';
import AclService from '../../../services/acl.service';
import UserSettingsService from '../../../services/user-settings.service';

export default angular
  .module('dashboard', [
    uiRouter,
  ])
  .component('dashboard', DashboardComponent)
  .service('ReportService', ReportService)
  .service('AclService', AclService)
  .service('UserSettingsService', UserSettingsService)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.dashboard', {
        url: '/dashboard',
        component: 'dashboard',
        // data: {
        //   displayName: 'Listing',
        //   breadcrumbProxy: ($state) => {
        //     if ($state.current.name.includes('report.probe')) return 'dashboard.reports.probe';
        //     if ($state.current.name.includes('report.genomic')) return 'dashboard.reports.genomic';
        //     return 'dashboard.reports.dashboard';
        //   },
        // },
        // redirectTo: redirectExternal,
        // resolve: {
        //   /* eslint-disable no-shadow */
        //   reports: async (ReportService) => {
        //     'ngInject';

        //     return ReportService.allFiltered({ states: 'ready,active' });
        //   },
        // },
      });
  })
  .name;
