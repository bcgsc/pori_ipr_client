import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DiscussionComponent from './discussion.component';

angular.module('discussion', [
  uiRouter,
]);

export default angular.module('discussion')
  .component('discussion', DiscussionComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.discussion', {
        url: '/discussion',
        component: 'discussion',
        resolve: {
          discussions: ['$transition$', 'DiscussionService', ($transition$, DiscussionService) => DiscussionService.all(
            $transition$.params().POG,
            $transition$.params().analysis_report,
          )],
        },
      });
  })
  .name;
