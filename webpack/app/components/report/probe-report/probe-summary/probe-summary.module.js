import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ProbeSummaryComponent from './probe-summary.component';

angular.module('probe.summary', [
  uiRouter,
]);

export default angular.module('probe.summary')
  .component('probesummary', ProbeSummaryComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.probe.summary', {
        url: '/summary',
        component: 'probesummary',
        resolve: {
          testInformation: ['$transition$', 'ProbeTestInformationService',
            async ($transition$, ProbeTestInformationService) => ProbeTestInformationService.retrieve(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          genomicEvents: ['$transition$', 'GenomicEventsService',
            async ($transition$, GenomicEventsService) => GenomicEventsService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
          signature: ['$transition$', 'ProbeSignatureService',
            async ($transition$, ProbeSignatureService) => ProbeSignatureService.retrieve(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
