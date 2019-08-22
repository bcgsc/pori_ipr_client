import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import SmallMutationVariantsComponent from './small-mutation-variants.component';

angular.module('smallMutationVariants', [
  uiRouter,
]);

export default angular.module('smallMutationVariants')
  .component('smallMutationVariants', SmallMutationVariantsComponent)
  .name;
