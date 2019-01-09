import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicSummaryComponent from './genomic-summary.component';

angular.module('genomic.summary', [
  uiRouter,
]);

export default angular.module('genomic.summary')
  .component('genomicsummary', GenomicSummaryComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.summary', {
        url: '/summary',
        views: {
          '@': {
            component: 'genomicsummary',
          },
        },
      });
  })
  .name;
