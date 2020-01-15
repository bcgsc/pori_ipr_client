import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import { react2angular } from 'react2angular';
import KBMatchesView from '../../../../views/kbMatchesView';
import KBMatchesComponent from './index';

angular.module('kbmatches', [
  uiRouter,
]);

export default angular.module('kbmatches')
  .component('kbMatchesAngularComponent', react2angular(
    KBMatchesView,
    [
      'alterations',
      'novel',
      'unknown',
      'thisCancer',
      'otherCancer',
      'targetedGenes',
      'kbMatchesComponent',
    ],
  ))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.kbmatches', {
        url: '/kbmatches',
        component: 'kbMatchesAngularComponent',
        resolve: {
          // This is REQUIRED to be lower camel case for injections apparently
          // But React requires components to be PascalCase. Reassign in component.
          kbMatchesComponent: [() => KBMatchesComponent],
          alterations: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
            ),
          ],
          novel: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'novel',
            ),
          ],
          unknown: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'unknown',
            ),
          ],
          thisCancer: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'thisCancer',
            ),
          ],
          otherCancer: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'otherCancer',
            ),
          ],
          targetedGenes: ['$transition$', 'TargetedGenesService',
            async ($transition$, TargetedGenesService) => TargetedGenesService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            ),
          ],
        },
      });
  })
  .name;
