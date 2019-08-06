import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ProbeReportComponent from './probe-report.component';
import ProbeSummaryModule from './probe-summary/probe-summary.module';
import DetailedGenomicAnalysisModule from './probe-detailed-genomic-analysis/probe-detailed-genomic-analysis.module';
import ProbeAppendicesModule from './probe-appendices/probe-appendices.module';
import ProbeReportSettingsModule from './probe-report-settings/probe-report-settings.module';

angular.module('probe.report', [
  uiRouter,
  ProbeSummaryModule,
  DetailedGenomicAnalysisModule,
  ProbeAppendicesModule,
  ProbeReportSettingsModule,
]);

export default angular.module('probe.report')
  .component('probereport', ProbeReportComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.probe', {
        url: '/probe',
        abstract: true,
        component: 'probereport',
        resolve: {
          report: ['$transition$', 'ReportService',
            async ($transition$, ReportService) => ReportService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
