import angular from 'angular';
import NavbarModule from './navbar/navbar.module';

const CommonModule = angular
  .module('root.common', [
    NavbarModule,
  ])
  .name;

export default CommonModule;
