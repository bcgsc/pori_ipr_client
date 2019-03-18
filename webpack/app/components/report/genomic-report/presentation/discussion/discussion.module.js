import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DiscussionComponent from './discussion.component';
import DiscussionEntryModule from '../../../../../common/discussion-entry/discussion-entry.module';

angular.module('discussion', [
  uiRouter,
  DiscussionEntryModule,
]);

export default angular.module('discussion')
  .component('discussion', DiscussionComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.discussion', {
        url: '/discussion',
        views: {
          '': {
            component: 'discussion',
          },
        },
        resolve: {
          discussions: ['$transition$', 'DiscussionService', ($transition$, DiscussionService) => {
            return DiscussionService.all(
              $transition$.params().POG, $transition$.params().analysis_report,
            );
          }],
        },
      });
  })
  .name;
