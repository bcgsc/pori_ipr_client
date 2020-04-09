import angular from 'angular';
import uiRouter from '@uirouter/angularjs/lib-esm';
import { react2angular } from 'react2angular';
import 'angular-file-upload';

import PrintComponent from './print.component';
import GenomicPrintComponent from './genomic-print/genomic-print.component';
import ProbePrintComponent from './probe-print/probe-print.component';
import PrintHeaderComponent from './print-header/print-header.component';

import GenomicSummaryComponent from '../report/genomic-report/genomic-summary/genomic-summary.component';
import AnalystCommentsComponent from '../report/genomic-report/analyst-comments/analyst-comments.component';
import PathwayAnalysisComponent from '../report/genomic-report/pathway-analysis/pathway-analysis.component';
import TherapeuticReactComponent from '../report/genomic-report/therapeutic/components/PrintTables';
import SlidesComponent from '../report/genomic-report/presentation/slides/slides.component';

import ProbeSummaryComponent from '../report/probe-report/probe-summary/probe-summary.component';
import ProbeDetailedGenomicAnalysisComponent from '../report/probe-report/probe-detailed-genomic-analysis/probe-detailed-genomic-analysis.component';
import ProbeAppendicesComponent from '../report/genomic-report/appendices/appendices.component';

import lazy from './lazy';

angular.module('print', [
  uiRouter,
  'angularFileUpload',
]);

export default angular.module('print')
  .component('print', PrintComponent)
  .component('genomicprint', GenomicPrintComponent)
  .component('probeprint', ProbePrintComponent)
  .component('printheader', PrintHeaderComponent)
  .component('genomicsummary', GenomicSummaryComponent)
  .component('analyst', AnalystCommentsComponent)
  .component('pathway', PathwayAnalysisComponent)
  .component('therapeuticReact', react2angular(TherapeuticReactComponent))
  .component('slides', SlidesComponent)
  .component('probeSummary', ProbeSummaryComponent)
  .component('detailedGenomicAnalysis', ProbeDetailedGenomicAnalysisComponent)
  .component('probeAppendices', ProbeAppendicesComponent)
  .config(($stateProvider) => {
    'ngInject';

    Object.values(lazy).forEach(state => $stateProvider.state(state));
  })
  .name;
