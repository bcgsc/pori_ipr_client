import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import 'angular-sortable-view';
import TherapeuticComponent from './therapeutic.component';

angular.module('therapeutic', [
  uiRouter,
  'angular-sortable-view',
]);

export default angular.module('therapeutic')
  .component('therapeutic', TherapeuticComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.therapeutic', {
        url: '/therapeutic',
        component: 'therapeutic',
        resolve: {
          therapeutic: ['$transition$', 'TherapeuticService',
            async ($transition$, TherapeuticService) => TherapeuticService.all(
              $transition$.params().POG,
              $transition$.params().analysis_report,
            )],
        },
      });
  })
  .name;
