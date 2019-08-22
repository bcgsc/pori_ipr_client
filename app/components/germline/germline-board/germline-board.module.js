import angular from 'angular';
import GermlineBoardComponent from './germline-board.component';

angular.module('germlineboard', []);

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
