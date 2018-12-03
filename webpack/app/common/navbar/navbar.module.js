import angular from 'angular';
import 'ngstorage';
import NavbarComponent from './navbar.component';

const NavbarModule = angular
  .module('navbar', [
    'ngStorage',
  ])
  .component('navbar', NavbarComponent)
  .name;

export default NavbarModule;
