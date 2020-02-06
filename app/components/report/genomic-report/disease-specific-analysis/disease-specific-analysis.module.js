import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DiseaseSpecificAnalysisComponent from './disease-specific-analysis.component';

angular.module('disease', [
  uiRouter,
]);

export default angular.module('disease')
  .component('disease', DiseaseSpecificAnalysisComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.diseaseSpecificAnalysis', {
        url: '/diseaseSpecificAnalysis',
        component: 'disease',
        resolve: {
          images: ['$transition$', 'ImageService', ($transition$, ImageService) => ImageService.get(
            $transition$.params().POG,
            $transition$.params().analysis_report,
            'microbial.circos',
          )],
          subtypePlotImages: ['$transition$', 'ImageService', ($transition$, ImageService) => ImageService.subtypePlots(
            $transition$.params().POG,
            $transition$.params().analysis_report,
          )],
        },
      });
  })
  .name;
