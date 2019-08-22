import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DetailedGenomicAnalysisComponent from './probe-detailed-genomic-analysis.component';

angular.module('probe.detailedgenomicanalysis', [
  uiRouter,
]);

export default angular.module('probe.detailedgenomicanalysis')
  .component('detailedgenomicanalysis', DetailedGenomicAnalysisComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.probe.detailedGenomicAnalysis', {
        url: '/detailedGenomicAnalysis',
        component: 'detailedgenomicanalysis',
        resolve: {
          alterations: ['$transition$', 'ProbeAlterationService',
            async ($transition$, ProbeAlterationService) => ProbeAlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          approvedThisCancer: ['$transition$', 'ProbeAlterationService',
            async ($transition$, ProbeAlterationService) => ProbeAlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'thisCancer',
            )],
          approvedOtherCancer: ['$transition$', 'ProbeAlterationService',
            async ($transition$, ProbeAlterationService) => ProbeAlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'otherCancer',
            )],
        },
      });
  })
  .name;
