import angular from 'angular';
import GeneViewerComponent from './gene-viewer.component';

angular.module('geneviewer', []);

export default angular.module('geneviewer')
  .component('geneViewer', GeneViewerComponent)
  .name;
