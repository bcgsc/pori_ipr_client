import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GermlineBoardComponent from './germline-board/germline-board.component';
import GermlineReportComponent from './germline-report/germline-report.component';
import lazy from './lazy';

angular.module('germline', [
  uiRouter,
]);

export default angular.module('germline')
  .component('germlineboard', GermlineBoardComponent)
  .component('germlinereport', GermlineReportComponent)
  .config(($stateProvider) => {
    'ngInject';

    Object.values(lazy).forEach(state => $stateProvider.state(state));
  })
  .name;
