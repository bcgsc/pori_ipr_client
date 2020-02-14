import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ProbeModule from './probe-report/probe-report.module';
import eagerGenomicReportStates from './genomic-report/eager';

angular.module('report', [
  uiRouter,
  ProbeModule,
]);

export default angular.module('report')
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog', {
        url: '/:POG/report/:analysis_report',
        abstract: true,
        resolve: {
          pog: ['$transition$', 'PogService', async ($transition$, PogService) => PogService.id($transition$.params().POG)],
        },
      });

    Object.values(eagerGenomicReportStates).forEach(state => $stateProvider.state(state));
  })
  .name;
