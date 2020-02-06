import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicSummaryComponent from './genomic-summary.component';

angular.module('genomic.summary', [
  uiRouter,
]);

export default angular.module('genomic.summary')
  .component('genomicsummary', GenomicSummaryComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.summary', {
        url: '/summary',
        component: 'genomicsummary',
        resolve: {
          genomicAlterations: ['$transition$', 'GenomicAlterationsService',
            async ($transition$, GenomicAlterationsService) => GenomicAlterationsService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          variantCounts: ['$transition$', 'VariantCountsService',
            async ($transition$, VariantCountsService) => VariantCountsService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          mutationSummary: ['$transition$', 'MutationSummaryService',
            async ($transition$, MutationSummaryService) => MutationSummaryService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          probeTarget: ['$transition$', 'ProbeTargetService',
            async ($transition$, ProbeTargetService) => ProbeTargetService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          mutationSignature: ['$transition$', 'MutationSignatureService',
            async ($transition$, MutationSignatureService) => MutationSignatureService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          microbial: ['$transition$', 'MicrobialService',
            async ($transition$, MicrobialService) => MicrobialService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
