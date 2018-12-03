import angular from 'angular';
import NavbarModule from './navbar/navbar.module';

const CommonModule = angular
  .module('app.common', [
    NavbarModule,
  ])
  .name;

export default CommonModule;
