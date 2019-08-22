import angular from 'angular';
import ProjectsEditComponent from './projects-edit.component';

angular.module('projectsedit', []);

export default angular.module('projectsedit')
  .component('projectsEdit', ProjectsEditComponent)
  .name;
