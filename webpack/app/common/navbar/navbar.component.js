import template from './navbar.pug';

export default {
  template: template,
  controller: class NavbarComponent {
    /* @ngInject */
    constructor($scope, $state, $mdDialog, $mdToast, UserSettingsService,
      UserService, KeycloakService) {
      this.$scope = $scope;
      this.$state = $state;
      this.$mdDialog = $mdDialog;
      this.$mdToast = $mdToast;
      this.UserSettingsService = UserSettingsService;
      this.UserService = UserService;
      this.KeycloakService = KeycloakService;
    }

    async $onInit() {
      this.user = await this.UserService.me();
      this.maximized = this.UserSettingsService.get('sideBarState');
      this.$scope.$digest();
    }

    // Toggle sidebar
    toggleSidebar() {
      this.$scope.$emit('sidebarToggle');
      this.maximized = !this.$scope.maximized;
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
            newUser: newUser,
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
  },
};
