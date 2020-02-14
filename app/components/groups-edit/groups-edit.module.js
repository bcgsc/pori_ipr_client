import angular from 'angular';
import GroupsEditComponent from './groups-edit.component';

angular.module('groupsedit', []);

export default angular.module('groupsedit')
  .component('groupsEdit', GroupsEditComponent)
  .name;
