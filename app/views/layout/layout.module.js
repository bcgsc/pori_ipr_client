import angular from 'angular';
import NavbarModule from './navbar/navbar.module';
import SidebarModule from './sidebar/sidebar.module';

export default angular.module('root.layout', [
  NavbarModule,
  SidebarModule,
])
  .name;
