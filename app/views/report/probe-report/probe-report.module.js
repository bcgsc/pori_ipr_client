import angular from 'angular';
import uiRouter from '@uirouter/angularjs/lib-esm';
import ProbeReportComponent from './probe-report.component';
import ProbeSummaryComponent from './probe-summary/probe-summary.component';
import DetailedGenomicAnalysisComponent from './probe-detailed-genomic-analysis/probe-detailed-genomic-analysis.component';
import ProbeAppendicesComponent from '../genomic-report/appendices/appendices.component';
import ProbeReportSettingsComponent from '../genomic-report/report-settings/report-settings.component';

import lazy from './lazy';

angular.module('probe.report', [
  uiRouter,
]);

export default angular.module('probe.report')
  .component('probereport', ProbeReportComponent)
  .component('probesummary', ProbeSummaryComponent)
  .component('detailedGenomicAnalysis', DetailedGenomicAnalysisComponent)
  .component('probeappendices', ProbeAppendicesComponent)
  .component('probesettings', ProbeReportSettingsComponent)
  .config(($stateProvider) => {
    'ngInject';

    Object.values(lazy).forEach(state => $stateProvider.state(state));
  })
  .name;
