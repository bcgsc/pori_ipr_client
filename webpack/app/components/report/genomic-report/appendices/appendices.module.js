import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import AppendicesComponent from './appendices.component';

angular.module('appendices', [
  uiRouter,
]);

export default angular.module('appendices')
  .component('appendices', AppendicesComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.appendices', {
        url: '/appendices',
        component: 'appendices',
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
