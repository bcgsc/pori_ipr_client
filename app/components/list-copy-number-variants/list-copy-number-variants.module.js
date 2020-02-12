import angular from 'angular';
import ListCopyNumberVariantsComponent from './list-copy-number-variants.component';

angular.module('listcopynumbervariants', []);

export default angular.module('listcopynumbervariants')
  .component('listCopyNumberVariants', ListCopyNumberVariantsComponent)
  .name;
