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
        views: {
          '@^': {
            component: 'structuralvariants',
          },
        },
        resolve: {
          images: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => {
              return ImageService.get(
                $transition$.params().POG,
                $transition$.params().analysis_report,
                'mutation_summary.barplot_sv,mutation_summary.density_plot_sv,circosSv.genome,circosSv.transcriptome',
              );
            }],
          mutationSummary: ['$transition$', 'MutationSummaryService',
            async ($transition$, MutationSummaryService) => {
              return MutationSummaryService.get(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          structuralVariants: ['$transition$', 'StructuralVariantsService',
            async ($transition$, StructuralVariantsService) => {
              return StructuralVariantsService.all(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          mutationSummaryImages: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => {
              return ImageService.mutationSummary(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          mavisSummary: ['$transition$', 'MavisService',
            async ($transition$, MavisService) => {
              return MavisService.all(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
