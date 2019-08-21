import template from './root.pug';

const bindings = {
  isAdmin: '<',
  user: '<',
};

class RootComponent {
  /* @ngInject */
  constructor($rootScope, UserService) {
    this.$rootScope = $rootScope;
    this.UserService = UserService;
  }

  async $onInit() {
    this.maximized = this.UserService.getSidebarState();
    this.$rootScope.showLoader = false;

    this.$rootScope.$on('sidebarToggle', () => {
      this.maximized = this.UserService.getSidebarState();
    });

    this.$rootScope.$on('navbarToggle', () => {
      this.maximized = this.UserService.getSidebarState();
    });
  }
}

export default {
  template,
  bindings,
  controller: RootComponent,
};
