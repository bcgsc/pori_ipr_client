import angular from 'angular';
import UserService from './user.service';
import UserSettingsService from './user-settings.service';
import PogService from './pog.service';

const ServiceModule = angular
  .module('root.services', [])
  .service(UserService)
  .service(UserSettingsService)
  .service(PogService)
  .name;

export default ServiceModule;
