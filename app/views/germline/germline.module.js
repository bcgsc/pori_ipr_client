import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GermlineComponent from './germline.component';
import GermlineReportComponent from './germline-report/germline-report.component';
import { germlineState, reportState } from './germline.states';

angular.module('germline', [
  uiRouter,
]);

export default angular.module('germline')
  .component('germline', GermlineComponent)
  .component('germlinereport', GermlineReportComponent)
  .config(($stateRegistryProvider) => {
    'ngInject';

    $stateRegistryProvider.register(germlineState);
    $stateRegistryProvider.register(reportState);
  });
