import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ProbeComponent from './probe.component';
import ReportListingCardModule from '../../../common/report-listing-card/report-listing-card.module';
import ReportStateModule from '../../../common/report-state/report-state.module';
import ReportTableModule from '../../../common/report-table/report-table.module';
import PaginateModule from '../../../common/paginate/paginate.module';

angular.module('probe', [
  uiRouter,
  ReportListingCardModule,
  ReportStateModule,
  ReportTableModule,
  PaginateModule,
]);

export default angular.module('probe')
  .component('probe', ProbeComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.probe', {
        url: '/probe',
        component: 'probe',
        resolve: {
          reports: ['ReportService', 'isExternalMode', async (ReportService, isExternalMode) => {
            const opts = {
              type: 'probe',
              all: true,
            };

            opts.states = 'uploaded,signedoff';

            if (isExternalMode) {
              opts.states = 'reviewed';
              opts.paginated = true;
            }
            return ReportService.allFiltered(opts);
          }],
        },
      });
  })
  .name;
