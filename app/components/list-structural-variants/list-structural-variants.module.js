import angular from 'angular';
import ListStructuralVariantsComponent from './list-structural-variants.component';

angular.module('liststructuralvariants', []);

export default angular.module('liststructuralvariants')
  .component('listStructuralVariants', ListStructuralVariantsComponent)
  .name;
