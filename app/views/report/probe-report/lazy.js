import eager from './eager';
import KBMatchesComponent from '../genomic-report/kb-matches/index';

const probe = {
  ...eager.probe,
  abstract: true,
  component: 'probereport',
  resolve: {
    report: ['$transition$', 'ReportService',
      async ($transition$, ReportService) => ReportService.getReport(
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
        $transition$.params().analysis_report,
      )],
    signatures: ['$transition$', 'SignatureService',
      async ($transition$, SignatureService) => SignatureService.getSignatures(
        $transition$.params().analysis_report,
      )],
    probeResults: ['$transition$', 'TargetedGenesService',
      async ($transition$, TargetedGenesService) => TargetedGenesService.getAll(
        $transition$.params().analysis_report,
      ),
    ],
  },
};

const detailedGenomicAnalysis = {
  ...eager.detailedGenomicAnalysis,
  component: 'detailedGenomicAnalysis',
  resolve: {
    // This is REQUIRED to be lower camel case for injections apparently
    // But React requires components to be PascalCase. Reassign in component.
    kbMatchesComponent: [() => KBMatchesComponent],
    alterations: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().analysis_report,
        { approvedTherapy: false, category: 'therapeutic,biological,diagnostic,prognostic' },
      ),
    ],
    unknown: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().analysis_report,
        { category: 'unknown,novel' },
      ),
    ],
    thisCancer: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().analysis_report,
        { matchedCancer: true, approvedTherapy: true, category: 'therapeutic' },
      ),
    ],
    otherCancer: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().analysis_report,
        { matchedCancer: false, approvedTherapy: true, category: 'therapeutic' },
      ),
    ],
    isProbe: () => true,
  },
};

const appendices = {
  ...eager.appendices,
  component: 'probeappendices',
  resolve: {
    tcgaAcronyms: ['$transition$', 'AppendicesService',
      async ($transition$, AppendicesService) => AppendicesService.tcga(
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
