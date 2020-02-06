import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GermlineBoardModule from './germline-board/germline-board.module';
import GermlineReportModule from './germline-report/germline-report.module';

angular.module('germline', [
  uiRouter,
  GermlineBoardModule,
  GermlineReportModule,
]);

export default angular.module('germline')
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.germline', {
        absract: true,
        url: '/germline',
      });
  })
  .name;
