import template from './navbar.pug';
import feedbackTemplate from './feedback/feedback.pug';
import feedbackController from './feedback/feedback';

class NavbarComponent {
  /* @ngInject */
  constructor($scope, $rootScope, $state, $mdDialog, $mdToast, UserService, KeycloakService) {
    this.$scope = $scope;
    this.$rootScope = $rootScope;
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
    this.maximized = this.UserService.getSidebarState();
    this.$scope.$digest();

    this.$rootScope.$on('navbarToggle', () => {
      this.maximized = this.UserService.getSidebarState();
    });
  }

  // Toggle sidebar
  toggleSidebar() {
    this.maximized = this.UserService.toggleSidebar();
    this.$rootScope.$emit('sidebarToggle');
  }

  // Open Feedback
  async openFeedback($event) {
    await this.$mdDialog.show({
      controller: feedbackController,
      template: feedbackTemplate,
      targetEvent: $event,
      clickOutsideToClose: true,
    });
  }

  async userLogout() {
    try {
      await this.KeycloakService.logout();
      this.$mdToast.showSimple('You have been logged out.');
    } catch (err) {
      this.$mdToast.showSimple('Error: Could not logout due to connection issue.');
      this.$state.go('public.login');
    }
  }
}

export default {
  template,
  controller: NavbarComponent,
};
