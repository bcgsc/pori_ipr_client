import angular from 'angular';
import ReportListingModule from './report-listing/report-listing.module';
import PublicModule from './public/public.module';
import eagerGermlineStates from './germline/eager';
import eagerAdminStates from './admin/eager';
import eagerPrintStates from './print/eager';
import eagerGenomicStates from './report/genomic-report/eager';
import eagerProbeStates from './report/probe-report/eager';
import eagerTermsStates from './TermsView/eager';

angular.module('root.views', [
  ReportListingModule,
  PublicModule,
]);

// Declare future states to be lazy loaded
export default angular.module('root.views')
  .config(($stateProvider) => {
    'ngInject';

    Object.values(eagerGermlineStates).forEach(state => $stateProvider.state(state));
    Object.values(eagerAdminStates).forEach(state => $stateProvider.state(state));
    Object.values(eagerPrintStates).forEach(state => $stateProvider.state(state));
    Object.values(eagerGenomicStates).forEach(state => $stateProvider.state(state));
    Object.values(eagerProbeStates).forEach(state => $stateProvider.state(state));
    Object.values(eagerTermsStates).forEach(state => $stateProvider.state(state));
  })
  .name;
