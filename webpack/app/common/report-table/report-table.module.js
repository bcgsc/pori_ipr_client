import angular from 'angular';
import ReportTableComponent from './report-table.component';

angular.module('report.table', []);

export default angular.module('report.table')
  .component('reportTable', ReportTableComponent)
  .name;
