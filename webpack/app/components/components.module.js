import angular from 'angular';
import HomeModule from './home/home.module';
import ReportListingModule from './report-listing/report-listing.module';

const ComponentsModule = angular
  .module('root.components', [
    HomeModule,
    ReportListingModule,
  ])
  .name;

export default ComponentsModule;
