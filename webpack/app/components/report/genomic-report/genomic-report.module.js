import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicReportComponent from './genomic-report.component';
import GenomicSummaryModule from './genomic-summary/genomic-summary.module';

angular.module('genomic.report', [
  uiRouter,
  GenomicSummaryModule,
]);

export default angular.module('genomic.report')
  .component('genomicreport', GenomicReportComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic', {
        url: '/genomic',
        abstract: true,
        views: {
          '@': {
            component: 'genomicreport',
          },
        },
      });
  })
  .name;
