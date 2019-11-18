import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ProbePrintComponent from './probe-print.component';

angular.module('print.probe', [
  uiRouter,
]);

export default angular.module('print.probe')
  .component('probeprint', ProbePrintComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('print.probe', {
        url: '/probe',
        component: 'probeprint',
        resolve: {
          testInformation: ['$transition$', 'ProbeTestInformationService',
            async ($transition$, ProbeTestInformationService) => ProbeTestInformationService.retrieve(
              $transition$.params().pog,
              $transition$.params().report,
            )],
          signature: ['$transition$', 'ProbeSignatureService',
            async ($transition$, ProbeSignatureService) => ProbeSignatureService.retrieve(
              $transition$.params().pog,
              $transition$.params().report,
            )],
        },
      });
  })
  .name;
