import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import SpearmanComponent from './spearman.component';

angular.module('spearman', [
  uiRouter,
]);

export default angular.module('spearman')
  .component('spearman', SpearmanComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.spearman', {
        url: '/spearman',
        component: 'spearman',
        resolve: {
          images: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => ImageService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'expression.chart,expression.legend',
            )],
        },
      });
  })
  .name;
