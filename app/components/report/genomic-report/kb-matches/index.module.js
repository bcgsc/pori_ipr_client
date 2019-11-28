import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import { react2angular } from 'react2angular';
import KbMatchesComponent from './index';

angular.module('kbmatches', [
  uiRouter,
]);

export default angular.module('kbmatches')
  .component('kbMatches', react2angular(KbMatchesComponent, ['rowData', 'columnDefs']))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.kbmatches', {
        url: '/kbmatches',
        component: 'kbMatches',
        resolve: {
          alterations: ['$transition$', 'AlterationService', async ($transition$, AlterationService) => {
            const respAll = await AlterationService.getAll(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
            );
            const respUnknown = await AlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'unknown',
            );
            const respNovel = await AlterationService.getType(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'genomic',
              'novel',
            );
            return respAll.concat(respUnknown, respNovel);
          }],
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
          rowData: () => ([{
            col1: 'test',
            col2: 'tost',
          }]),
          columnDefs: () => ([{
            headerName: 'headerone',
            field: 'col1',
            autoHeight: true,
          },
          {
            headerName: 'headertwo',
            field: 'col2',
          }]),
        },
      });
  })
  .name;
