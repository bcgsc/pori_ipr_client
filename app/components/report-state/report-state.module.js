import angular from 'angular';
import ReportState from './report-state.component';

angular.module('report.state', []);

export default angular.module('report.state')
  .component('reportState', ReportState)
  .name;
