import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import SmallMutationsComponent from './small-mutations.component';

angular.module('smallmutations', [
  uiRouter,
]);

export default angular.module('smallmutations')
  .component('smallmutations', SmallMutationsComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.smallMutations', {
        url: '/smallMutations',
        views: {
          '': {
            component: 'smallmutations',
          },
        },
        resolve: {
          images: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => {
              return ImageService.get(
                $transition$.params().POG,
                $transition$.params().analysis_report,
                'mutSignature.corPcors,mutSignature.snvsAllStrelka',
              );
            }],
          mutationSummaryImages: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => {
              return ImageService.mutationSummary(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          mutationSummary: ['$transition$', 'MutationSummaryService',
            async ($transition$, MutationSummaryService) => {
              return MutationSummaryService.get(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          smallMutations: ['$transition$', 'SmallMutationsService',
            async ($transition$, SmallMutationsService) => {
              return SmallMutationsService.all(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          mutationSignature: ['$transition$', 'MutationSignatureService',
            async ($transition$, MutationSignatureService) => {
              return MutationSignatureService.all(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
