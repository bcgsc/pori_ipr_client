import angular from 'angular';
import NavbarComponent from './navbar.component';
import './navbar.scss';

angular.module('navbar', []);

export default angular
  .module('navbar')
  .component('navbar', NavbarComponent)
  .name;
