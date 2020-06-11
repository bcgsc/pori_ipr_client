import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import { react2angular } from 'react2angular';
import ProbeReportComponent from './probe-report.component';
import ProbeSummaryComponent from './probe-summary/probe-summary.component';
import KBMatchesView from '../genomic-report/kb-matches/kbMatchesView';
import ProbeAppendicesComponent from '../genomic-report/appendices/appendices.component';
import ProbeReportSettingsComponent from '../genomic-report/report-settings/report-settings.component';
import ReportToolbar from '../../../components/ReportToolbar';

import lazy from './lazy';

angular.module('probe.report', [
  uiRouter,
]);

export default angular.module('probe.report')
  .component('probereport', ProbeReportComponent)
  .component('probesummary', ProbeSummaryComponent)
  .component('detailedGenomicAnalysis', react2angular(KBMatchesView))
  .component('reportToolbar', react2angular(ReportToolbar))
  .component('probeappendices', ProbeAppendicesComponent)
  .component('probesettings', ProbeReportSettingsComponent)
  .config(($stateProvider) => {
    'ngInject';

    Object.values(lazy).forEach(state => $stateProvider.state(state));
  })
  .name;
