import template from './sidebar.pug';

const bindings = {
  isAdmin: '<',
};

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
    const pages = ['report', 'germline'];

    pages.forEach(async (page) => {
      this.pageAccess[page] = await this.AclService.checkResource(page);
      this.$scope.$digest();
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
  bindings,
  controller: SidebarComponent,
};
