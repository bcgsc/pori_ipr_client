import * as eager from './eager';


export const germline = {
  ...eager.germline,
  abstract: true,
  lazyLoad: undefined,
};

export const board = {
  ...eager.board,
  component: 'germlineboard',
  resolve: {
    reports: ['GermlineService', async GermlineService => GermlineService.getAllReports()],
  },
};

export const report = {
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
