import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicSummaryComponent from './genomic-summary.component';
import TumourContentModule from '../../../../common/tumour-content/tumour-content.module';
import MutationSignatureModule from '../../../../common/mutation-signature/mutation-signature.module';

angular.module('genomic.summary', [
  uiRouter,
  TumourContentModule,
  MutationSignatureModule,
]);

export default angular.module('genomic.summary')
  .component('genomicsummary', GenomicSummaryComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.summary', {
        url: '/summary',
        views: {
          '': {
            component: 'genomicsummary',
          },
        },
        resolve: {
          genomicAlterations: ['$transition$', 'GenomicAlterationsService',
            async ($transition$, GenomicAlterationsService) => {
              return GenomicAlterationsService.all(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
          variantCounts: ['$transition$', 'VariantCountsService',
            async ($transition$, VariantCountsService) => {
              return VariantCountsService.get(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
          genomicEvents: ['$transition$', 'GenomicEventsService',
            async ($transition$, GenomicEventsService) => {
              return GenomicEventsService.all(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
          mutationSummary: ['$transition$', 'MutationSummaryService',
            async ($transition$, MutationSummaryService) => {
              return MutationSummaryService.get(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
          probeTarget: ['$transition$', 'ProbeTargetService',
            async ($transition$, ProbeTargetService) => {
              return ProbeTargetService.all(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
          mutationSignature: ['$transition$', 'MutationSignatureService',
            async ($transition$, MutationSignatureService) => {
              return MutationSignatureService.all(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
          microbial: ['$transition$', 'MicrobialService',
            async ($transition$, MicrobialService) => {
              return MicrobialService.get(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
