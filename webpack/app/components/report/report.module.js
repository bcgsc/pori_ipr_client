import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicModule from './genomic-report/genomic-report.module';
import ProbeModule from './probe-report/probe-report.module';

angular.module('report', [
  uiRouter,
  GenomicModule,
  ProbeModule,
]);

export default angular.module('report')
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog', {
        url: '/:POG/report/:analysis_report',
        resolve: {
          pog: ['$transition$', 'PogService', async ($transition$, PogService) => {
            return PogService.id($transition$.params().POG);
          }],
          reports: ['$transition$', 'ReportService', 'isExternalMode',
            async ($transition$, ReportService, isExternalMode) => {
              let stateFilter = {};
              if (isExternalMode) {
                stateFilter = { state: 'presented,archived' };
              }
              return ReportService.getAllReports($transition$.params().POG, stateFilter);
            }],
        },
      });
  })
  .name;
