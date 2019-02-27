import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ngQuill from 'ng-quill';
import 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';
import AnalystCommentsComponent from './analyst-comments.component';

angular.module('comments', [
  uiRouter,
  ngQuill,
]);

export default angular.module('comments')
  .component('analyst', AnalystCommentsComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.analystComments', {
        url: '/analystComments',
        views: {
          '': {
            component: 'analyst',
          },
        },
        resolve: {
          analystComments: ['$transition$', 'AnalystCommentsService',
            async ($transition$, AnalystCommentsService) => {
              return AnalystCommentsService.get(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
