import angular from 'angular';
import AdminbarComponent from './adminbar.component';

angular.module('adminbar', []);

export default angular.module('adminbar')
  .component('adminbar', AdminbarComponent)
  .name;
