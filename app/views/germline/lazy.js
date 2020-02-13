import eager from './eager';

const germline = {
  ...eager.germline,
  abstract: true,
  lazyLoad: undefined,
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
      $transition$.params().patient,
      $transition$.params().biopsy,
      $transition$.params().report,
    )],
  },
};

export default {
  germline,
  board,
  report,
};
