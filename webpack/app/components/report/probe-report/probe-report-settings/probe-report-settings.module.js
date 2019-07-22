import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ReportSettingsComponent from '../../genomic-report/report-settings/report-settings.component'; 

angular.module('reportsettings', [
  uiRouter,
]);

export default angular.module('reportsettings')
  .component('probereportsettings', ReportSettingsComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.probe.reportSettings', {
        url: '/reportSettings',
        views: {
          '': {
            component: 'probereportsettings',
          },
        },
        resolve: {
          showBindings: () => {
            return false;
          },
        },
      });
  })
  .name;
