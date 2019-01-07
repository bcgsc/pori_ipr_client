import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicReportComponent from './genomic-report.component';

angular.module('genomic.report', [
  uiRouter,
]);

export default angular.module('genomic.report')
  .component('genomicreport', GenomicReportComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic', {
        url: '/genomic',
        views: {
          '@': {
            component: 'genomicreport',
          },
        },
      });
  })
  .name;
