import angular from 'angular';
import PaginateComponent from './paginate.component';

angular.module('paginate', []);

export default angular.module('paginate')
  .component('paginate', PaginateComponent)
  .name;
