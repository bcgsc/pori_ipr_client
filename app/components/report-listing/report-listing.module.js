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
        resolve: {
          permission: ['$state', '$mdToast', 'AclService',
            async ($state, $mdToast, AclService) => {
              if (!(await AclService.checkAction('report.view'))) {
                $mdToast.showSimple('You do not have permissions to view reports');
                $state.go('public.login');
                return false;
              }
              return true;
            }],
        },
      });
  })
  .name;
