import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DashboardModule from './dashboard/dashboard.module';
import GenomicModule from './genomic/genomic.module';
import ProbeModule from './probe/probe.module';
import './report-listing.scss';

const ReportListingModule = angular
  .module('reportlisting', [
    uiRouter,
    DashboardModule,
    GenomicModule,
    ProbeModule,
  ])
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting', {
        abstract: true,
        url: 'reports',
        resolve: {
          permission: ['$state', '$mdToast', 'AclService',
            async ($state, $mdToast, AclService) => {
              if (!AclService.checkAction('report.view')) {
                $mdToast.showSimple(AclService.checkAction('report.view'));
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
