import angular from 'angular';
import RoleCardComponent from './role-card.component';

angular.module('rolecard', []);

export default angular.module('rolecard')
  .component('roleCard', RoleCardComponent)
  .name;
