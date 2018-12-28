import template from './sidebar.pug';

export default {
  template: template,
  controller: class SidebarComponent {
    /* @ngInject */
    constructor($rootScope, UserSettingsService, AclService, $state) {
      this.$rootScope = $rootScope;
      this.UserSettingsService = UserSettingsService;
      this.AclService = AclService;
      this.$state = $state;
      this.pageAccess = {};
    }
    
    $onInit() {
      const pages = ['analyses', 'tracking', 'report', 'genomic_report',
        'probe_report', 'germline', 'knowledgebase'];
      pages.forEach((page) => {
        this.pageAccess[page] = this.AclService.checkResource(page);
      });
      this.maximized = this.UserSettingsService.get('sideBarState');
      this.$rootScope.$on('sidebarToggle', () => {
        this.UserSettingsService.save('sideBarState', !this.maximized);
        this.maximized = !this.maximized;
      });
    }
  },
};
