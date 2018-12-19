import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DashboardModule from './dashboard/dashboard.module';
import AclService from '../../services/acl.service';

const ReportListingModule = angular
  .module('reportlisting', [
    uiRouter,
    DashboardModule,
  ])
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting', {
        abstract: true,
        url: 'reports',
        // resolve: {
        //   permission: async ($state, user, $mdToast) => {
        //     'ngInject';
            
        //     if (!AclService.action('report.view', user)) {
        //       $mdToast.showSimple('You are not allowed to view reports');
        //       $state.go('dashboard.home');
        //       return false;
        //     }
        //     return true;
        //   },
        // },
      });
  })
  .name;

export default ReportListingModule;
