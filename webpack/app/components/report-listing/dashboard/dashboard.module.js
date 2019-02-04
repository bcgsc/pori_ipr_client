import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import DashboardComponent from './dashboard.component';
import ReportListingCardModule from '../../../common/report-listing-card/report-listing-card.module';

angular.module('dashboard', [
  uiRouter,
  ReportListingCardModule,
]);

export default angular.module('dashboard')
  .component('dashboard', DashboardComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.dashboard', {
        url: '/dashboard',
        views: {
          '@': {
            component: 'dashboard',
          },
        },
        resolve: {
          reports: ['ReportService', async (ReportService) => {
            return ReportService.allFiltered({ states: 'ready,active' });
          }],
        },
      });
  })
  .name;
