import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import { react2angular } from 'react2angular';
import KbMatchesComponent from './index';

angular.module('kbmatches', [
  uiRouter,
]);

export default angular.module('kbmatches')
  .component('kbMatches', react2angular(KbMatchesComponent,
    ['alterations', 'novelAlterations', 'unknownAlterations', 'approvedThisCancer', 'approvedOtherCancer', 'targetedGenes']))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.kbmatches', {
        url: '/kbmatches',
        component: 'kbMatches',
        resolve: {
          alterations: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
            ),
          ],
          novelAlterations: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'novel',
            ),
          ],
          unknownAlterations: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'unknown',
            ),
          ],
          approvedThisCancer: ['$transition$', 'AlterationService',
            async ($transition$, AlterationService) => AlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'thisCancer',
            ),
          ],
          approvedOtherCancer: ['$transition$', 'AlterationService',
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
