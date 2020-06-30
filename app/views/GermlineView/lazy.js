import eager from './eager';

const germline = {
  ...eager.germline,
  abstract: true,
  lazyLoad: undefined,
  resolve: {
    permissionCheck: ['AclService', '$state', async (AclService, $state) => {
      if (!await AclService.checkResource('germline')) {
        $state.go('root.reportlisting.reports');
      }
    }],
  },
};

const board = {
  ...eager.board,
  component: 'germlineboard',
  resolve: {
    reports: ['GermlineService', async GermlineService => GermlineService.getAllReports()],
  },
};

const report = {
  ...eager.report,
  component: 'germlinereport',
  resolve: {
    report: ['GermlineService', '$transition$', async (GermlineService, $transition$) => GermlineService.getReport(
      $transition$.params().report,
    )],
  },
};

export default {
  germline,
  board,
  report,
};
