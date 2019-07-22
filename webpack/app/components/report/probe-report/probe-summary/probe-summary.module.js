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
        views: {
          '': {
            component: 'probesummary',
          },
        },
        resolve: {
          testInformation: ['$transition$', 'ProbeTestInformationService',
            async ($transition$, ProbeTestInformationService) => {
              return ProbeTestInformationService.retrieve(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          genomicEvents: ['$transition$', 'GenomicEventsService',
            async ($transition$, GenomicEventsService) => {
              return GenomicEventsService.all(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
          signature: ['$transition$', 'ProbeSignatureService',
            async ($transition$, ProbeSignatureService) => {
              return ProbeSignatureService.retrieve(
                $transition$.params().POG,
                $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
