import angular from 'angular';
import PrintHeaderComponent from './print-header.component';

angular.module('printheader', []);

export default angular.module('printheader')
  .component('printHeader', PrintHeaderComponent)
  .name;
