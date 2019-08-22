import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import StructuralVariantsComponent from './structural-variants.component';

angular.module('structuralvariants', [
  uiRouter,
]);

export default angular.module('structuralvariants')
  .component('structuralvariants', StructuralVariantsComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.structuralVariation', {
        url: '/structuralVariation',
        component: 'structuralvariants',
        resolve: {
          images: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => ImageService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'mutation_summary.barplot_sv,mutation_summary.density_plot_sv,circosSv.genome,circosSv.transcriptome',
            )],
          mutationSummary: ['$transition$', 'MutationSummaryService',
            async ($transition$, MutationSummaryService) => MutationSummaryService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          structuralVariants: ['$transition$', 'StructuralVariantsService',
            async ($transition$, StructuralVariantsService) => StructuralVariantsService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          mutationSummaryImages: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => ImageService.mutationSummary(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          mavisSummary: ['$transition$', 'MavisService',
            async ($transition$, MavisService) => MavisService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
