import angular from 'angular';
import GermlineReportComponent from './germline-report.component';

angular.module('germlinereport', []);

export default angular.module('germlinereport')
  .component('germlinereport', GermlineReportComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.germline.report', {
        url: '/report/patient/:patient/biopsy/:biopsy/report/:report',
        component: 'germlinereport',
        resolve: {
          report: ['GermlineService', '$transition$', async (GermlineService, $transition$) => GermlineService.getReport(
            $transition$.params().patient,
            $transition$.params().biopsy,
            $transition$.params().report,
          )],
        },
      });
  })
  .name;
