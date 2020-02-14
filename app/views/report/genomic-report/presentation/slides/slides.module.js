import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import 'angular-file-upload';
import GenomicSlidesComponent from './slides.component';

angular.module('slides', [
  uiRouter,
  'angularFileUpload',
]);

export default angular.module('slides')
  .component('slides', GenomicSlidesComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.slide', {
        url: '/slide',
        component: 'slides',
        resolve: {
          slides: ['$transition$', 'SlidesService',
            async ($transition$, SlidesService) => SlidesService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
