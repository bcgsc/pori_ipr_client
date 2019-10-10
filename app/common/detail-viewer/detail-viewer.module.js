import angular from 'angular';
import DetailViewerComponent from './detail-viewer.component';

angular.module('detailViewer', []);

export default angular.module('detailViewer')
  .component('detailViewer', DetailViewerComponent)
  .name;
