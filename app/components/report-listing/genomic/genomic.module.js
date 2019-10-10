import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicComponent from './genomic.component';
import ReportListingCardModule from '../../../common/report-listing-card/report-listing-card.module';
import ReportState from '../../../common/report-state/report-state.module';
import PaginateModule from '../../../common/paginate/paginate.module';
import './genomic.scss';

angular.module('genomic', [
  uiRouter,
  ReportListingCardModule,
  ReportState,
  PaginateModule,
]);

export default angular.module('genomic')
  .component('genomic', GenomicComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.genomic', {
        url: '/genomic',
        component: 'genomic',
        resolve: {
          reports: ['ReportService', 'UserService', 'isExternalMode',
            async (ReportService, UserService, isExternalMode) => {
              const currentUser = await UserService.getSetting('genomicReportListCurrentUser');
              const project = await UserService.getSetting('selectedProject') || { name: undefined };
              
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
