import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import { react2angular } from 'react2angular';
import 'ng-quill';
import 'angular-file-upload';
import 'angular-sortable-view';
import GenomicReportComponent from './genomic-report.component';
import SummaryComponent from './genomic-summary/genomic-summary.component';
import AnalystCommentsComponent from './analyst-comments/analyst-comments.component';
import PathwayAnalysisComponent from './pathway-analysis/pathway-analysis.component';
import TherapeuticComponent from './therapeutic/therapeutic.component';
import SlidesComponent from './presentation/slides/slides.component';
import DiscussionComponent from './presentation/discussion/discussion.component';
import KBMatchesView from './kb-matches/kbMatchesView';
import MicrobialComponent from './microbial/microbial.component';
import SpearmanComponent from './spearman/spearman.component';
import DiseaseSpecificAnalysisComponent from './disease-specific-analysis/disease-specific-analysis.component';
import SmallMutationsComponent from './small-mutations';
import CopyNumberAnalysesComponent from './copy-number-analyses/copy-number-analyses.component';
import StructuralVariantsComponent from './structural-variants/structural-variants.component';
import ExpressionAnalysisAngularComponent from './expression/expression-analysis.component';
import ExpressionAnalysisComponent from './expression';
import AppendicesComponent from './appendices/appendices.component';
import ReportSettingsComponent from './report-settings/report-settings.component';
import lazy from './lazy';
import 'quill/dist/quill.snow.css';

angular.module('genomic.report', [
  uiRouter,
  'angularFileUpload',
  'angular-sortable-view',
  'ngQuill',
]);

export default angular.module('genomic.report')
  .component('genomicreport', GenomicReportComponent)
  .component('summary', SummaryComponent)
  .component('analystComments', AnalystCommentsComponent)
  .component('pathwayAnalysis', PathwayAnalysisComponent)
  .component('therapeutic', TherapeuticComponent)
  .component('slides', SlidesComponent)
  .component('discussion', DiscussionComponent)
  .component('kbMatchesAngularComponent', react2angular(KBMatchesView))
  .component('microbial', MicrobialComponent)
  .component('spearman', SpearmanComponent)
  .component('diseaseSpecific', DiseaseSpecificAnalysisComponent)
  .component('smallMutations', react2angular(SmallMutationsComponent))
  .component('copyNumber', CopyNumberAnalysesComponent)
  .component('structuralVariants', StructuralVariantsComponent)
  .component('expressionReact', react2angular(ExpressionAnalysisComponent))
  .component('expression', ExpressionAnalysisAngularComponent)
  .component('appendices', AppendicesComponent)
  .component('settings', ReportSettingsComponent)
  .config(($stateProvider) => {
    'ngInject';

    Object.values(lazy).forEach(state => $stateProvider.state(state));
  })
  .name;
