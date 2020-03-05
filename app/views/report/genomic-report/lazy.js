import eager from './eager';
import KBMatchesComponent from './kb-matches/index';

const genomic = {
  ...eager.genomic,
  component: 'genomicreport',
  abstract: true,
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
  component: 'summary',
  resolve: {
    genomicAlterations: ['$transition$', 'GenomicAlterationsService',
      async ($transition$, GenomicAlterationsService) => GenomicAlterationsService.all(
        $transition$.params().analysis_report,
      )],
    variantCounts: ['$transition$', 'VariantCountsService',
      async ($transition$, VariantCountsService) => VariantCountsService.get(
        $transition$.params().analysis_report,
      )],
    mutationSummary: ['$transition$', 'MutationSummaryService',
      async ($transition$, MutationSummaryService) => MutationSummaryService.get(
        $transition$.params().analysis_report,
      )],
    probeTarget: ['$transition$', 'ProbeTargetService',
      async ($transition$, ProbeTargetService) => ProbeTargetService.all(
        $transition$.params().analysis_report,
      )],
    mutationSignature: ['$transition$', 'MutationSignatureService',
      async ($transition$, MutationSignatureService) => MutationSignatureService.all(
        $transition$.params().analysis_report,
      )],
    microbial: ['$transition$', 'MicrobialService',
      async ($transition$, MicrobialService) => MicrobialService.get(
        $transition$.params().analysis_report,
      )],
  },
};

const analystComments = {
  ...eager.analystComments,
  component: 'analystComments',
  resolve: {
    analystComments: ['$transition$', 'AnalystCommentsService',
      async ($transition$, AnalystCommentsService) => AnalystCommentsService.get(
        $transition$.params().analysis_report,
      )],
  },
};

const pathwayAnalysis = {
  ...eager.pathwayAnalysis,
  component: 'pathwayAnalysis',
  resolve: {
    pathway: ['$transition$', 'PathwayAnalysisService',
      async ($transition$, PathwayAnalysisService) => PathwayAnalysisService.retrieve(
        $transition$.params().analysis_report,
      )],
  },
};

const therapeutic = {
  ...eager.therapeutic,
  component: 'therapeutic',
  resolve: {
    therapeutic: ['$transition$', 'TherapeuticService',
      async ($transition$, TherapeuticService) => TherapeuticService.all(
        $transition$.params().POG,
        $transition$.params().analysis_report,
      )],
  },
};

const slides = {
  ...eager.slides,
  component: 'slides',
  resolve: {
    slides: ['$transition$', 'SlidesService',
      async ($transition$, SlidesService) => SlidesService.all(
        $transition$.params().analysis_report,
      )],
  },
};

const discussion = {
  ...eager.discussion,
  component: 'discussion',
  resolve: {
    discussions: ['$transition$', 'DiscussionService', ($transition$, DiscussionService) => DiscussionService.all(
      $transition$.params().analysis_report,
    )],
  },
};

const kbMatches = {
  ...eager.kbMatches,
  component: 'kbMatchesAngularComponent',
  resolve: {
    // This is REQUIRED to be lower camel case for injections apparently
    // But React requires components to be PascalCase. Reassign in component.
    kbMatchesComponent: [() => KBMatchesComponent],
    alterations: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getAll(
        $transition$.params().analysis_report,
        'genomic',
      ),
    ],
    novel: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getAll(
        $transition$.params().analysis_report,
        'genomic',
        'novel',
      ),
    ],
    unknown: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getAll(
        $transition$.params().analysis_report,
        'genomic',
        'unknown',
      ),
    ],
    thisCancer: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().analysis_report,
        'genomic',
        'thisCancer',
      ),
    ],
    otherCancer: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().analysis_report,
        'genomic',
        'otherCancer',
      ),
    ],
    targetedGenes: ['$transition$', 'TargetedGenesService',
      async ($transition$, TargetedGenesService) => TargetedGenesService.getAll(
        $transition$.params().analysis_report,
      ),
    ],
  },
};

const microbial = {
  ...eager.microbial,
  component: 'microbial',
  resolve: {
    images: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.get(
        $transition$.params().analysis_report,
        'microbial.circos.transcriptome,microbial.circos.genome,microbial.circos',
      )],
  },
};

const spearman = {
  ...eager.spearman,
  component: 'spearman',
  resolve: {
    images: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.get(
        $transition$.params().analysis_report,
        'expression.chart,expression.legend',
      )],
  },
};

const diseaseSpecific = {
  ...eager.diseaseSpecific,
  component: 'diseaseSpecific',
  resolve: {
    images: ['$transition$', 'ImageService', ($transition$, ImageService) => ImageService.get(
      $transition$.params().analysis_report,
      'microbial.circos',
    )],
    subtypePlotImages: ['$transition$', 'ImageService', ($transition$, ImageService) => ImageService.subtypePlots(
      $transition$.params().analysis_report,
    )],
  },
};

const smallMutations = {
  ...eager.smallMutations,
  component: 'smallMutations',
  resolve: {
    images: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.get(
        $transition$.params().analysis_report,
        'mutSignature.corPcors,mutSignature.snvsAllStrelka',
      )],
    mutationSummaryImages: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.mutationSummary(
        $transition$.params().analysis_report,
      )],
    mutationSummary: ['$transition$', 'MutationSummaryService',
      async ($transition$, MutationSummaryService) => MutationSummaryService.get(
        $transition$.params().analysis_report,
      )],
    smallMutations: ['$transition$', 'SmallMutationsService',
      async ($transition$, SmallMutationsService) => SmallMutationsService.all(
        $transition$.params().analysis_report,
      )],
    mutationSignature: ['$transition$', 'MutationSignatureService',
      async ($transition$, MutationSignatureService) => MutationSignatureService.all(
        $transition$.params().analysis_report,
      )],
  },
};

const copyNumber = {
  ...eager.copyNumber,
  component: 'copyNumber',
  resolve: {
    images: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.get(
        $transition$.params().analysis_report,
        'cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5',
      )],
    mutationSummary: ['$transition$', 'MutationSummaryService',
      async ($transition$, MutationSummaryService) => MutationSummaryService.get(
        $transition$.params().analysis_report,
      )],
    cnvs: ['$transition$', 'CopyNumberAnalysesService',
      async ($transition$, CopyNumberAnalysesService) => CopyNumberAnalysesService.all(
        $transition$.params().analysis_report,
      )],
  },
};

const structuralVariants = {
  ...eager.structuralVariants,
  component: 'structuralVariants',
  resolve: {
    images: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.get(
        $transition$.params().analysis_report,
        'mutation_summary.barplot_sv,mutation_summary.density_plot_sv,circosSv.genome,circosSv.transcriptome',
      )],
    mutationSummary: ['$transition$', 'MutationSummaryService',
      async ($transition$, MutationSummaryService) => MutationSummaryService.get(
        $transition$.params().analysis_report,
      )],
    structuralVariants: ['$transition$', 'StructuralVariantsService',
      async ($transition$, StructuralVariantsService) => StructuralVariantsService.all(
        $transition$.params().analysis_report,
      )],
    mutationSummaryImages: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.mutationSummary(
        $transition$.params().analysis_report,
      )],
    mavisSummary: ['$transition$', 'MavisService',
      async ($transition$, MavisService) => MavisService.all(
        $transition$.params().analysis_report,
      )],
  },
};

const expression = {
  ...eager.expression,
  component: 'expression',
  resolve: {
    mutationSummary: ['$transition$', 'MutationSummaryService',
      async ($transition$, MutationSummaryService) => MutationSummaryService.get(
        $transition$.params().analysis_report,
      )],
    outliers: ['$transition$', 'OutlierService',
      async ($transition$, OutlierService) => OutlierService.all(
        $transition$.params().analysis_report,
      )],
    drugTargets: ['$transition$', 'DrugTargetService',
      async ($transition$, DrugTargetService) => DrugTargetService.all(
        $transition$.params().analysis_report,
      )],
    densityGraphs: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.expDensityGraphs(
        $transition$.params().analysis_report,
      )],
  },
};

const appendices = {
  ...eager.appendices,
  component: 'appendices',
  resolve: {
    tcgaAcronyms: ['$transition$', 'AppendicesService',
      async ($transition$, AppendicesService) => AppendicesService.tcga(
        $transition$.params().POG,
        $transition$.params().analysis_report,
      )],
  },
};

const settings = {
  ...eager.settings,
  component: 'settings',
  resolve: {
    showBindings: () => true,
  },
};

export default {
  genomic,
  summary,
  analystComments,
  pathwayAnalysis,
  therapeutic,
  slides,
  discussion,
  kbMatches,
  microbial,
  spearman,
  diseaseSpecific,
  smallMutations,
  copyNumber,
  structuralVariants,
  expression,
  appendices,
  settings,
};
