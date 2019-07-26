import angular from 'angular';
import SidebarComponent from './sidebar.component';
import './sidebar.scss';

angular.module('sidebar', []);

export default angular.module('sidebar')
  .component('sidebar', SidebarComponent)
  .name;
