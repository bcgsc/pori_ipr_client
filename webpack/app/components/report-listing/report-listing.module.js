import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DashboardModule from './dashboard/dashboard.module';
import GenomicModule from './genomic/genomic.module';
import './report-listing.scss';

const ReportListingModule = angular
  .module('reportlisting', [
    uiRouter,
    DashboardModule,
    GenomicModule,
  ])
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting', {
        abstract: true,
        url: 'reports',
        resolve: {
          permission: ['$state', 'user', '$mdToast', 'AclService',
            async ($state, user, $mdToast, AclService) => {
              if (await !AclService.checkAction('report.view', user)) {
                $mdToast.showSimple('You are not allowed to view reports');
                $state.go('root.home');
                return false;
              }
              return true;
            }],
        },
      });
  })
  .name;

export default ReportListingModule;
