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

    this.maximized = this.UserService.getSidebarState();

    this.$rootScope.$on('sidebarToggle', () => {
      this.maximized = this.UserService.getSidebarState();
    });
  }

  toggleNavbar() {
    this.maximized = this.UserService.toggleSidebar();
    this.$rootScope.$emit('navbarToggle');
  }
}

export default {
  template,
  controller: SidebarComponent,
};
