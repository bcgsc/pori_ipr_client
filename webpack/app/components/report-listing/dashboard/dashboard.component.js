import template from './dashboard.pug';

export default {
  template: template,
  controller: class DashboardComponent {
    /* @ngInject */
    constructor($rootScope, UserSettingsService, AclService) {
      this.$rootScope = $rootScope;
      this.UserSettingsService = UserSettingsService;
      this.AclService = AclService;
    }
    
    $onInit() {
      this.check = {
        resource: this.AclService.resource,
        action: this.AclService.action,
      };
      this.maximized = this.UserSettingsService.get('sideBarState');
      this.$rootScope.$on('sidebarToggle', () => {
        this.UserSettingsService.save('sideBarState', !this.maximized);
        this.maximized = !this.maximized;
      });
    }
  },
};
