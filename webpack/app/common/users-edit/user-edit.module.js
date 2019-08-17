import angular from 'angular';
import UserEditComponent from './user-edit.component';

angular.module('useredit', []);

export default angular.module('useredit')
  .component('userEdit', UserEditComponent)
  .name;
