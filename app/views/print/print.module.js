import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import PrintComponent from './print.component';
import GenomicPrintComponent from './genomic-print/genomic-print.component';
import ProbePrintComponent from './probe-print/probe-print.component';
import PrintHeaderComponent from './print-header/print-header.component';
import lazy from './lazy';

angular.module('print', [
  uiRouter,
]);

export default angular.module('print')
  .component('print', PrintComponent)
  .component('genomicprint', GenomicPrintComponent)
  .component('probeprint', ProbePrintComponent)
  .component('printheader', PrintHeaderComponent)
  .config(($stateProvider) => {
    'ngInject';

    Object.values(lazy).forEach(state => $stateProvider.state(state));
  })
  .name;
