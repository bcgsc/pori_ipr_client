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
        views: {
          '': {
            component: 'spearman',
          },
        },
        resolve: {
          images: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => {
              return ImageService.get(
                $transition$.params().POG,
                $transition$.params().analysis_report,
                'expression.chart,expression.legend',
              );
            }],
        },
      });
  })
  .name;
