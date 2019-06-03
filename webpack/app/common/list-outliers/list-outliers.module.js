import angular from 'angular';
import ListOutliersComponent from './list-outliers.component';

angular.module('listoutliers', []);

export default angular.module('listoutliers')
  .component('listOutliers', ListOutliersComponent)
  .name;
