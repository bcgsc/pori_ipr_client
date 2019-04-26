import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import 'svg-pan-zoom';
import PathwayAnalysisComponent from './pathway-analysis.component';

angular.module('pathway', [
  uiRouter,
]);

export default angular.module('pathway')
  .component('pathway', PathwayAnalysisComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.pathwayAnalysis', {
        url: '/pathwayAnalysis',
        views: {
          '': {
            component: 'pathway',
          },
        },
        resolve: {
          pathway: ['$transition$', 'PathwayAnalysisService',
            async ($transition$, PathwayAnalysisService) => {
              return PathwayAnalysisService.get(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
