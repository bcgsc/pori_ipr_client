import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GermlineBoardComponent from './germline-board/germline-board.component';
import GermlineReportComponent from './germline-report/germline-report.component';
import { germline, board, report } from './lazy';

angular.module('germline', [
  uiRouter,
]);

export default angular.module('germline')
  .component('germlineboard', GermlineBoardComponent)
  .component('germlinereport', GermlineReportComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider.state(germline);
    $stateProvider.state(board);
    $stateProvider.state(report);
  })
  .name;
