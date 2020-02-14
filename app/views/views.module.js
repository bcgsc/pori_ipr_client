import angular from 'angular';
import ReportListingModule from './report-listing/report-listing.module';
import ReportModule from './report/report.module';
import PublicModule from './public/public.module';
import LayoutModule from './layout/layout.module';
import eagerGermlineStates from './germline/eager';
import eagerAdminStates from './admin/eager';
import eagerPrintStates from './print/eager';

angular.module('root.views', [
  ReportListingModule,
  ReportModule,
  PublicModule,
  LayoutModule,
]);

// Declare future states to be lazy loaded
export default angular.module('root.views')
  .config(($stateProvider) => {
    'ngInject';

    Object.values(eagerGermlineStates).forEach(state => $stateProvider.state(state));
    Object.values(eagerAdminStates).forEach(state => $stateProvider.state(state));
    Object.values(eagerPrintStates).forEach(state => $stateProvider.state(state));
  })
  .name;
