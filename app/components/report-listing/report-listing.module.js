import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DashboardModule from './dashboard/dashboard.module';
import GenomicModule from './genomic/genomic-react/genomic';
import ProbeModule from './probe/probe.module';
import './report-listing.scss';

export default angular.module('reportlisting', [
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
        url: '/reports',
        resolve: {
          permission: ['$state', '$mdToast', 'AclService',
            async ($state, $mdToast, AclService) => {
              if (!(await AclService.checkAction('report.view'))) {
                $mdToast.showSimple('You do not have permissions to view reports');
                $state.go('root.home');
                return false;
              }
              return true;
            }],
        },
      });
  })
  .name;
