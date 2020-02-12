import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DetailedGenomicAnalysisComponent from './probe-detailed-genomic-analysis.component';

angular.module('probe.detailedgenomicanalysis', [
  uiRouter,
]);

export default angular.module('probe.detailedgenomicanalysis')
  .component('detailedGenomicAnalysis', DetailedGenomicAnalysisComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.probe.detailedGenomicAnalysis', {
        url: '/detailedGenomicAnalysis',
        component: 'detailedGenomicAnalysis',
        resolve: {
          alterations: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'probe',
            )],
          approvedThisCancer: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'probe',
              'thisCancer',
            )],
          approvedOtherCancer: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'probe',
              'otherCancer',
            )],
        },
      });
  })
  .name;
