import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicComponent from './genomic.component';
import ReportListingCardModule from '../report-listing-card/report-listing-card.module';
import ReportState from '../report-state/report-state.module';
import './genomic.scss';

angular.module('genomic', [
  uiRouter,
  ReportListingCardModule,
  ReportState,
]);

export default angular.module('genomic')
  .component('genomic', GenomicComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.genomic', {
        url: '/genomic',
        views: {
          '@': {
            component: 'genomic',
          },
        },
        resolve: {
          reports: ['ReportService', 'UserSettingsService', 'user', 'isExternalMode',
            async (ReportService, UserSettingsService, user, isExternalMode) => {
              const currentUser = UserSettingsService.get('genomicReportListCurrentUser');
              const project = UserSettingsService.get('selectedProject') || { name: undefined };
              
              const opts = {
                type: 'genomic',
              };

              if (currentUser === null || currentUser === undefined || currentUser === true) {
                opts.states = 'ready,active,presented';
                opts.project = project.name;
              } else {
                opts.all = true;
                opts.states = 'ready,active,presented';
                opts.project = project.name;
              }

              if (isExternalMode) {
                opts.all = true;
                opts.states = 'presented,archived';
                opts.paginated = true;
              }
              return ReportService.allFiltered(opts);
            }],
        },
      });
  })
  .name;
