import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ExpressionAnalysisComponent from './expression-analysis.component';

angular.module('expression', [
  uiRouter,
]);

export default angular.module('expression')
  .component('expression', ExpressionAnalysisComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.expressionAnalysis', {
        url: '/expressionAnalysis',
        views: {
          '': {
            component: 'expression',
          },
        },
        resolve: {
          mutationSummary: ['$transition$', 'MutationSummaryService',
            async ($transition$, MutationSummaryService) => {
              return MutationSummaryService.get(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          outliers: ['$transition$', 'OutlierService',
            async ($transition$, OutlierService) => {
              return OutlierService.all(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          drugTargets: ['$transition$', 'DrugTargetService',
            async ($transition$, DrugTargetService) => {
              return DrugTargetService.all(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          densityGraphs: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => {
              return ImageService.expDensityGraphs(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
