import angular from 'angular';
import GenomicAlterationComponent from './genomic-alteration.component';

angular.module('genomicalteration', []);

export default angular.module('genomicalteration')
  .component('genomicAlteration', GenomicAlterationComponent)
  .name;
