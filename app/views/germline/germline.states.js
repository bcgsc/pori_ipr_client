export const germlineState = {
  name: 'germline',
  parent: 'root',
  url: '/germline',
  component: 'germline',
  resolve: {
    reports: ['GermlineService', async GermlineService => GermlineService.getAllReports()],
  },
};

export const reportState = {
  name: 'report',
  parent: 'root.germline',
  url: '/report/patient/:patient/biopsy/:biopsy/report/:report',
  component: 'germlinereport',
  resolve: {
    report: ['GermlineService', '$transition$', async (GermlineService, $transition$) => GermlineService.getReport(
      $transition$.params().patient,
      $transition$.params().biopsy,
      $transition$.params().report,
    )],
  },
};
