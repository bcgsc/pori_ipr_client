import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import GenomicReportComponent from './genomic-report.component';
import GenomicSummaryModule from './genomic-summary/genomic-summary.module';
import AnalystCommentsModule from './analyst-comments/analyst-comments.module';
import SlidesModule from './presentation/slides/slides.module';
import DiscussionModule from './presentation/discussion/discussion.module';
import TherapeuticModule from './therapeutic/therapeutic.module';
import PathwayAnalysisModule from './pathway-analysis/pathway-analysis.module';
import MicrobialModule from './microbial/microbial.module';
import SpearmanModule from './spearman/spearman.module';
import DiseaseSpecificAnalysisModule from './disease-specific-analysis/disease-specific-analysis.module';
import SmallMutationsModule from './small-mutations/small-mutations.module';
import CopyNumberAnalysesModule from './copy-number-analyses/copy-number-analyses.module';
import StructuralVariantsModule from './structural-variants/structural-variants.module';
import ExpressionAnalysisModule from './expression/expression-analysis.module';
import AppendicesModule from './appendices/appendices.module';

angular.module('genomic.report', [
  uiRouter,
  GenomicSummaryModule,
  AnalystCommentsModule,
  SlidesModule,
  DiscussionModule,
  TherapeuticModule,
  PathwayAnalysisModule,
  MicrobialModule,
  SpearmanModule,
  DiseaseSpecificAnalysisModule,
  SmallMutationsModule,
  CopyNumberAnalysesModule,
  StructuralVariantsModule,
  ExpressionAnalysisModule,
  AppendicesModule,
]);

export default angular.module('genomic.report')
  .component('genomicreport', GenomicReportComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.pog.genomic', {
        url: '/genomic',
        abstract: true,
        views: {
          '@': {
            component: 'genomicreport',
          },
        },
        resolve: {
          report: ['$transition$', 'ReportService',
            async ($transition$, ReportService) => {
              return ReportService.get(
                $transition$.params().POG, $transition$.params().analysis_report,
              );
            }],
        },
      });
  })
  .name;
