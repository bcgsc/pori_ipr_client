import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import CopyNumberAnalysesComponent from './copy-number-analyses.component';

angular.module('copynumberanalyses', [
  uiRouter,
]);

export default angular.module('copynumberanalyses')
  .component('copynumberanalyses', CopyNumberAnalysesComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.copyNumberAnalyses', {
        url: '/copyNumberAnalyses',
        component: 'copynumberanalyses',
        resolve: {
          images: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => ImageService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5',
            )],
          mutationSummary: ['$transition$', 'MutationSummaryService',
            async ($transition$, MutationSummaryService) => MutationSummaryService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          cnvs: ['$transition$', 'CopyNumberAnalysesService',
            async ($transition$, CopyNumberAnalysesService) => CopyNumberAnalysesService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
