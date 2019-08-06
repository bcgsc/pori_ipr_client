import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import MicrobialComponent from './microbial.component';

angular.module('microbial', [
  uiRouter,
]);

export default angular.module('microbial')
  .component('microbial', MicrobialComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.microbial', {
        url: '/microbial',
        component: 'microbial',
        resolve: {
          images: ['$transition$', 'ImageService',
            async ($transition$, ImageService) => ImageService.get(
              $transition$.params().POG,
              $transition$.params().analysis_report,
              'microbial.circos.transcriptome,microbial.circos.genome,microbial.circos',
            )],
        },
      });
  })
  .name;
