import angular from 'angular';
import HomeModule from './home/home.module';
import ReportListingModule from './report-listing/report-listing.module';
import ReportModule from './report/report.module';
import PublicModule from './public/public.module';
import GermlineModule from './germline/germline.module';
import AdminModule from './admin/admin.module';

export default angular.module('root.components', [
  HomeModule,
  ReportListingModule,
  ReportModule,
  PublicModule,
  GermlineModule,
  AdminModule,
])
  .name;
