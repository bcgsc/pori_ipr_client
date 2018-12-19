import angular from 'angular';
import NavbarComponent from './navbar.component';
import UserSettingsService from '../../services/user-settings.service';
import UserService from '../../services/user.service';

const NavbarModule = angular
  .module('navbar', [])
  .component('navbar', NavbarComponent)
  .service(UserSettingsService)
  .service(UserService)
  .name;

export default NavbarModule;
