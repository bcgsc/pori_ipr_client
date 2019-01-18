import angular from 'angular';
import NavbarModule from './navbar/navbar.module';
import SidebarModule from './sidebar/sidebar.module';

const CommonModule = angular
  .module('root.common', [
    NavbarModule,
    SidebarModule,
  ])
  .name;

export default CommonModule;
