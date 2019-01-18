import angular from 'angular';
import HomeModule from './home/home.module';
import ReportListingModule from './report-listing/report-listing.module';
import PublicModule from './public/public.module';

const ComponentsModule = angular
  .module('root.components', [
    HomeModule,
    ReportListingModule,
    PublicModule,
  ])
  .name;

export default ComponentsModule;
