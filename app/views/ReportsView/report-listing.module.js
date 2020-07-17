import angular from 'angular';
import reportsModule from './reports.module';

export default angular.module('reportlisting', [
  reportsModule,
])
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting', {
        abstract: true,
      });
  })
  .name;
