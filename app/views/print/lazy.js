import eager from './eager';

const print = {
  ...eager.print,
  component: 'print',
  abstract: true,
  resolve: {
    pog: ['$transition$', 'PogService', async ($transition$, PogService) => PogService.id($transition$.params().pog)],
    report: ['$transition$', 'ReportService',
      async ($transition$, ReportService) => ReportService.get(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    user: ['UserService', '$state', async (UserService, $state) => {
      try {
        const resp = await UserService.me();
        return resp;
      } catch (err) {
        $state.go('public.login');
        return err;
      }
    }],
  },
  lazyLoad: undefined,
};

const genomic = {
  ...eager.genomic,
  component: 'genomicprint',
  resolve: {
    genomicAlterations: ['$transition$', 'GenomicAlterationsService',
      async ($transition$, GenomicAlterationsService) => GenomicAlterationsService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    variantCounts: ['$transition$', 'VariantCountsService',
      async ($transition$, VariantCountsService) => VariantCountsService.get(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    mutationSummary: ['$transition$', 'MutationSummaryService',
      async ($transition$, MutationSummaryService) => MutationSummaryService.get(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    probeTarget: ['$transition$', 'ProbeTargetService',
      async ($transition$, ProbeTargetService) => ProbeTargetService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    mutationSignature: ['$transition$', 'MutationSignatureService',
      async ($transition$, MutationSignatureService) => MutationSignatureService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    microbial: ['$transition$', 'MicrobialService',
      async ($transition$, MicrobialService) => MicrobialService.get(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    therapeutic: ['$transition$', 'TherapeuticService',
      async ($transition$, TherapeuticService) => TherapeuticService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    analystComments: ['$transition$', 'AnalystCommentsService',
      async ($transition$, AnalystCommentsService) => AnalystCommentsService.get(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    pathway: ['$transition$', 'PathwayAnalysisService',
      async ($transition$, PathwayAnalysisService) => PathwayAnalysisService.retrieve(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    smallMutationImages: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.get(
        $transition$.params().pog,
        $transition$.params().report,
        'mutSignature.corPcors,mutSignature.snvsAllStrelka',
      )],
    mutationSummaryImages: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.mutationSummary(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    smallMutations: ['$transition$', 'SmallMutationsService',
      async ($transition$, SmallMutationsService) => SmallMutationsService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    copyNumberAnalysesImages: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.get(
        $transition$.params().pog,
        $transition$.params().report,
        'cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5',
      )],
    cnvs: ['$transition$', 'CopyNumberAnalysesService',
      async ($transition$, CopyNumberAnalysesService) => CopyNumberAnalysesService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    structuralVariantsImages: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.get(
        $transition$.params().pog,
        $transition$.params().report,
        'mutation_summary.barplot_sv,mutation_summary.density_plot_sv,circosSv.genome,circosSv.transcriptome',
      )],
    structuralVariants: ['$transition$', 'StructuralVariantsService',
      async ($transition$, StructuralVariantsService) => StructuralVariantsService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    mavisSummary: ['$transition$', 'MavisService',
      async ($transition$, MavisService) => MavisService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    outliers: ['$transition$', 'OutlierService',
      async ($transition$, OutlierService) => OutlierService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    drugTargets: ['$transition$', 'DrugTargetService',
      async ($transition$, DrugTargetService) => DrugTargetService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    densityGraphs: ['$transition$', 'ImageService',
      async ($transition$, ImageService) => ImageService.expDensityGraphs(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    tcgaAcronyms: ['$transition$', 'AppendicesService',
      async ($transition$, AppendicesService) => AppendicesService.tcga(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    slides: ['$transition$', 'SlidesService',
      async ($transition$, SlidesService) => SlidesService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    therapeuticRowData: ['$transition$', 'TherapeuticService',
      async ($transition$, TherapeuticService) => TherapeuticService.all(
        $transition$.params().pog,
        $transition$.params().report,
      )],
  },
};

const probe = {
  ...eager.probe,
  component: 'probeprint',
  resolve: {
    testInformation: ['$transition$', 'ProbeTestInformationService',
      async ($transition$, ProbeTestInformationService) => ProbeTestInformationService.retrieve(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    signature: ['$transition$', 'ProbeSignatureService',
      async ($transition$, ProbeSignatureService) => ProbeSignatureService.retrieve(
        $transition$.params().pog,
        $transition$.params().report,
      )],
    alterations: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getAll(
        $transition$.params().pog,
        $transition$.params().report,
        'probe',
      )],
    approvedThisCancer: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().pog,
        $transition$.params().report,
        'probe',
        'thisCancer',
      )],
    approvedOtherCancer: ['$transition$', 'AlterationService',
      async ($transition$, AlterationService) => AlterationService.getType(
        $transition$.params().pog,
        $transition$.params().report,
        'probe',
        'otherCancer',
      )],
    tcgaAcronyms: ['$transition$', 'AppendicesService',
      async ($transition$, AppendicesService) => AppendicesService.tcga(
        $transition$.params().pog,
        $transition$.params().report,
      )],
  },
};

export default {
  print,
  genomic,
  probe,
};
