import template from './navbar.pug';

class NavbarComponent {
  /* @ngInject */
  constructor($scope, $state, $mdDialog, $mdToast, UserService, KeycloakService) {
    this.$scope = $scope;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.UserService = UserService;
    this.KeycloakService = KeycloakService;
  }

  // CONFIG and VERSION are injected with webpack
  async $onInit() {
    this.user = await this.UserService.me();
    this.config = CONFIG.ATTRS.name;
    this.version = VERSION;
    this.maximized = await this.UserService.getSetting('sideBarState');
    this.$scope.$digest();
  }

  // Toggle sidebar
  toggleSidebar() {
    this.$scope.$emit('sidebarToggle');
    this.maximized = !this.maximized;
  }

  // Open Feedback
  async openFeedback($event) {
    await this.$mdDialog.show({
      controller: 'controller.dashboard.toolbar.feedback',
      templateUrl: 'dashboard/feedback.html',
      targetEvent: $event,
      clickOutsideToClose: false,
    });
  }

  async userLogout() {
    try {
      await this.KeycloakService.logout();
      this.$mdToast.showSimple('You have been logged out.');
      this.$state.go('public.login');
    } catch (err) {
      this.$mdToast.showSimple('Error: Could not logout due to connection issue.');
      this.$state.go('public.login');
    }
  }

  // Edit User
  async userDiag($event, editUser, newUser = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        templateUrl: 'dashboard/admin/user/user.edit.html', // fix url
        clickOutToClose: false,
        locals: {
          editUser: angular.copy(editUser),
          newUser,
          userDelete: {},
          projects: [],
          accessGroup: {},
          selfEdit: true,
        },
        controller: 'controller.dashboard.user.edit', // fix controller
      });
      this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
      this.users.forEach((u, i) => {
        if (u.ident === resp.data.ident) this.users[i] = resp.data;
      });
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent(
        'Your user information has not been updated.',
      ));
    }
  }
}

export default {
  template,
  controller: NavbarComponent,
};
