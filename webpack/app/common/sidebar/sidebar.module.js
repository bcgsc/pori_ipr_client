import angular from 'angular';
import SidebarComponent from './sidebar.component';
import ReportService from '../../services/report.service';
import AclService from '../../services/acl.service';
import UserSettingsService from '../../services/user-settings.service';
import './sidebar.scss';

angular.module('sidebar', []);

export default angular.module('sidebar')
  .component('sidebar', SidebarComponent)
  .service('ReportService', ReportService)
  .service('AclService', AclService)
  .service('UserSettingsService', UserSettingsService)
  .name;
