import angular from 'angular';
import ReportListingCardComponent from './report-listing-card.component';

angular.module('report.listing.card', []);

export default angular.module('report.listing.card')
  .component('reportListingCard', ReportListingCardComponent)
  .name;
