import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import { react2angular } from 'react2angular';
import GenomicPrintComponent from './genomic-print.component';
import TherapeuticReactComponent from '../../report/genomic-report/therapeutic/therapeutic';

angular.module('print.genomic', [
  uiRouter,
]);

export default angular.module('print.genomic')
  .component('genomicprint', GenomicPrintComponent)
  .component('therapeuticReact', react2angular(TherapeuticReactComponent))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('print.genomic', {
        url: '/genomic',
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
            async ($transition$, TherapeuticService) => {
              const rowData = await TherapeuticService.all(
                $transition$.params().pog,
                $transition$.params().report,
              );
              const rows = rowData.map(({
                createdAt, ident, rank, resistance, targetContext, type, updatedAt, ...keepRow
              }) => keepRow);

              return rows.map((row) => {
                row.target = row.target.map(({ geneVar }) => geneVar).join(', ');
                return row;
              });
            }],
          therapeuticColumnDefs: ['therapeuticRowData', async (therapeuticRowData) => {
            const columnNames = Object.keys(therapeuticRowData[0]);
            const columns = [];
            columnNames.forEach((col) => {
              columns.push({
                headerName: col,
                field: col,
              });
            });
            return columns;
          }],
        },
      });
  })
  .name;
