import angular from 'angular';
import genomicModule from './genomic/genomic.module';

export default angular.module('reportlisting', [
  genomicModule,
])
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting', {
        abstract: true,
        url: '/reports',
        resolve: {
          permission: ['$state', '$mdToast', 'AclService',
            async ($state, $mdToast, AclService) => {
              if (!(await AclService.checkAction('report.view'))) {
                $mdToast.showSimple('You do not have permissions to view reports');
                $state.go('root.home');
                return false;
              }
              return true;
            }],
        },
      });
  })
  .name;
