import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicReportComponent from './genomic-report.component';
import GenomicSummaryModule from './genomic-summary/genomic-summary.module';
import AnalystCommentsModule from './analyst-comments/analyst-comments.module';

angular.module('genomic.report', [
  uiRouter,
  GenomicSummaryModule,
  AnalystCommentsModule,
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
        resolve: {
          report: ['$transition$', 'ReportService',
            async ($transition$, ReportService) => {
              return ReportService.get(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
