import angular from 'angular';
import UsersEditComponent from './users-edit.component';

angular.module('usersedit', []);

export default angular.module('usersedit')
  .component('usersEdit', UsersEditComponent)
  .name;
