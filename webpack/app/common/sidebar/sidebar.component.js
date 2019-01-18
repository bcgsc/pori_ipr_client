import template from './sidebar.pug';

class SidebarComponent {
  /* @ngInject */
  constructor($rootScope, UserSettingsService, AclService, $state) {
    this.$rootScope = $rootScope;
    this.UserSettingsService = UserSettingsService;
    this.AclService = AclService;
    this.$state = $state;
    this.pageAccess = {};
  }
  
  async $onInit() {
    const pages = ['analyses', 'tracking', 'report', 'genomic_report',
      'probe_report', 'germline', 'knowledgebase'];
    pages.forEach((page) => {
      this.pageAccess[page] = this.AclService.checkResource(page);
    });
    this.maximized = await this.UserSettingsService.get('sideBarState');
    this.$rootScope.$on('sidebarToggle', async () => {
      await this.UserSettingsService.save('sideBarState', !this.maximized);
      this.maximized = !this.maximized;
    });
  }
}

export default {
  template,
  controller: SidebarComponent,
};
