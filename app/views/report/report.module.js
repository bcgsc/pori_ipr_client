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
          pog: ['$transition$', 'PogService', async ($transition$, PogService) => PogService.id($transition$.params().POG)],
        },
      });
  })
  .name;
