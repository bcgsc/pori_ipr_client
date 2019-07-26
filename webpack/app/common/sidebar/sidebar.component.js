import template from './sidebar.pug';

class SidebarComponent {
  /* @ngInject */
  constructor($rootScope, UserService, AclService, $state, $scope) {
    this.$rootScope = $rootScope;
    this.UserService = UserService;
    this.AclService = AclService;
    this.$state = $state;
    this.$scope = $scope;
    this.pageAccess = {};
  }
  
  async $onInit() {
    const pages = ['analyses', 'tracking', 'report', 'genomic_report',
      'probe_report', 'germline', 'knowledgebase'];

    pages.forEach(async (page) => {
      this.pageAccess[page] = await this.AclService.checkResource(page);
    });

    this.maximized = await this.UserService.getSetting('sideBarState');

    this.$rootScope.$on('sidebarToggle', async () => {
      await this.UserService.saveSetting('sideBarState', !this.maximized);
      this.maximized = !this.maximized;
      this.$rootScope.$digest();
    });
  }
}

export default {
  template,
  controller: SidebarComponent,
};
