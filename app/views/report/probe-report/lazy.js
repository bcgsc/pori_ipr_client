import eager from './eager';

const probe = {
  ...eager.probe,
  abstract: true,
  component: 'probereport',
  resolve: {
    report: ['$transition$', 'ReportService',
      async ($transition$, ReportService) => ReportService.get(
        $transition$.params().POG,
        $transition$.params().analysis_report,
      )],
    reportEdit: ['AclService', async AclService => AclService.checkAction('report.edit')],
  },
  lazyLoad: undefined,
};

const summary = {
  ...eager.summary,
  component: 'probesummary',
  resolve: {
    testInformation: ['$transition$', 'ProbeTestInformationService',
      async ($transition$, ProbeTestInformationService) => ProbeTestInformationService.retrieve(
        $transition$.params().POG,
        $transition$.params().analysis_report,
      )],
    signature: ['$transition$', 'ProbeSignatureService',
      async ($transition$, ProbeSignatureService) => ProbeSignatureService.retrieve(
        $transition$.params().POG,
        $transition$.params().analysis_report,
      )],
    genomicEvents: ['$transition$', 'GenomicEventsService',
      async ($transition$, GenomicEventsService) => GenomicEventsService.all(
        $transition$.params().POG,
        $transition$.params().analysis_report,
      )],
  },
};

const detailedGenomicAnalysis = {
  ...eager.detailedGenomicAnalysis,
  component: 'detailedGenomicAnalysis',
  resolve: {
    alterations: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getAll(
        $transition$.params().POG,
        $transition$.params().analysis_report,
        'probe',
      )],
    approvedThisCancer: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().POG,
        $transition$.params().analysis_report,
        'probe',
        'thisCancer',
      )],
    approvedOtherCancer: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().POG,
        $transition$.params().analysis_report,
        'probe',
        'otherCancer',
      )],
  },
};

const appendices = {
  ...eager.appendices,
  component: 'probeappendices',
  resolve: {
    tcgaAcronyms: ['$transition$', 'AppendicesService',
      async ($transition$, AppendicesService) => AppendicesService.tcga(
        $transition$.params().POG,
        $transition$.params().analysis_report,
      )],
    probe: () => true,
  },
};

const settings = {
  ...eager.settings,
  component: 'probesettings',
  resolve: {
    showBindings: () => false,
  },
};

export default {
  probe,
  summary,
  detailedGenomicAnalysis,
  appendices,
  settings,
};
