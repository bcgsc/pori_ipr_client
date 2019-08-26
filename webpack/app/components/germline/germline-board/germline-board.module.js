import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GermlineBoardComponent from './germline-board.component';

angular.module('germlineboard', [
  uiRouter,
]);

export default angular.module('germlineboard')
  .component('germlineboard', GermlineBoardComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.germline.board', {
        url: '/board',
        component: 'germlineboard',
        resolve: {
          reports: ['GermlineService', async GermlineService => GermlineService.getAllReports()],
        },
      });
  })
  .name;
