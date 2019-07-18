import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ReportSettingsComponent from './report-settings.component';

angular.module('reportsettings', [
  uiRouter,
]);

export default angular.module('reportsettings')
  .component('reportsettings', ReportSettingsComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic.reportSettings', {
        url: '/reportSettings',
        views: {
          '': {
            component: 'reportsettings',
          },
        },
      });
  })
  .name;
