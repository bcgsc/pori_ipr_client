import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import AppendicesComponent from '../../genomic-report/appendices/appendices.component';

angular.module('probe.appendices', [
  uiRouter,
]);

export default angular.module('probe.appendices')
  .component('probeappendices', AppendicesComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.probe.appendices', {
        url: '/appendices',
        component: 'probeappendices',
        resolve: {
          tcgaAcronyms: ['$transition$', 'AppendicesService',
            async ($transition$, AppendicesService) => AppendicesService.tcga(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
