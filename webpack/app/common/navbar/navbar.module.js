import angular from 'angular';
import ngMaterial from 'angular-material';
import NavbarComponent from './navbar.component';
import UserSettingsService from '../../services/user-settings.service';
import UserService from '../../services/user.service';
import './navbar.scss';

const NavbarModule = angular
  .module('navbar', [
    ngMaterial,
  ])
  .component('navbar', NavbarComponent)
  .service(UserSettingsService)
  .service(UserService)
  .name;

export default NavbarModule;
