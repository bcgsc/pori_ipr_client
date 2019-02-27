import angular from 'angular';
import TumourContentComponent from './tumour-content.component';

angular.module('tumour.content', []);

export default angular.module('tumour.content')
  .component('tumourContent', TumourContentComponent)
  .name;
