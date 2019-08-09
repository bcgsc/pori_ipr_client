import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ReportSettingsComponent from '../../genomic-report/report-settings/report-settings.component';

angular.module('probe.reportsettings', [
  uiRouter,
]);

export default angular.module('probe.reportsettings')
  .component('probereportsettings', ReportSettingsComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.probe.reportSettings', {
        url: '/reportSettings',
        component: 'probereportsettings',
        resolve: {
          showBindings: () => false,
        },
      });
  })
  .name;
