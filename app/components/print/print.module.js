import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import PrintComponent from './print.component';
import GenomicPrintModule from './genomic-print/genomic-print.module';
import ProbePrintModule from './probe-print/probe-print.module';

angular.module('print', [
  uiRouter,
  GenomicPrintModule,
  ProbePrintModule,
]);

export default angular.module('print')
  .component('print', PrintComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('print', {
        url: '/print/:pog/report/:report',
        component: 'print',
        abstract: true,
        resolve: {
          pog: ['$transition$', 'PogService', async ($transition$, PogService) => PogService.id($transition$.params().pog)],
          report: ['$transition$', 'ReportService',
            async ($transition$, ReportService) => ReportService.get(
              $transition$.params().pog,
              $transition$.params().report,
            )],
          user: ['UserService', '$state', async (UserService, $state) => {
            try {
              const resp = await UserService.me();
              return resp;
            } catch (err) {
              $state.go('public.login');
              return err;
            }
          }],
        },
      });
  })
  .name;
