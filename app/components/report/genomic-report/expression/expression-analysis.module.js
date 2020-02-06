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
        component: 'expression',
        resolve: {
          mutationSummary: ['$transition$', 'MutationSummaryService',
            async ($transition$, MutationSummaryService) => MutationSummaryService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          outliers: ['$transition$', 'OutlierService',
            async ($transition$, OutlierService) => OutlierService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          drugTargets: ['$transition$', 'DrugTargetService',
            async ($transition$, DrugTargetService) => DrugTargetService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          densityGraphs: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => ImageService.expDensityGraphs(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
