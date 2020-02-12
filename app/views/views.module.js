import angular from 'angular';
import ReportListingModule from './report-listing/report-listing.module';
import ReportModule from './report/report.module';
import PublicModule from './public/public.module';
import AdminModule from './admin/admin.module';
import LayoutModule from './layout/layout.module';
import PrintModule from './print/print.module';

angular.module('root.views', [
  ReportListingModule,
  ReportModule,
  PublicModule,
  AdminModule,
  LayoutModule,
  PrintModule,
]);

// Declare future states to be lazy loaded
export default angular.module('root.views')
  .config(($stateRegistryProvider) => {
    'ngInject';

    $stateRegistryProvider
      .register({
        name: 'germline.**',
        parent: 'root',
        url: '/germline',
        lazyLoad: async ($transition$) => {
          const ocLazyLoad = $transition$.injector().get('$ocLazyLoad');
          const mod = await import('./germline/germline.module');
          return ocLazyLoad.inject(mod.default);
        },
      });
  })
  .name;
