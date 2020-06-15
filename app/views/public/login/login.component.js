class LoginRedirect {
  /* @ngInject */
  constructor(UserService, $state, $mdToast, $sessionStorage, KeycloakService) {
    this.UserService = UserService;
    this.$state = $state;
    this.$mdToast = $mdToast;
    this.$sessionStorage = $sessionStorage;
    this.KeycloakService = KeycloakService;
  }

  async $onInit() {
    try {
      await this.KeycloakService.setToken();

      if (this.$sessionStorage.returnToState) {
        this.$state.go(this.$sessionStorage.returnToState, this.$sessionStorage.returnParams);
        delete this.$sessionStorage.returnToState;
        delete this.$sessionStorage.returnParams;
      } else {
        this.$state.go('root.reportlisting.reports');
      }
    } catch (err) {
      this.$mdToast.show(
        this.$mdToast.simple('No response from the server. Please try again later').hideDelay(7000),
      );
    }
  }
}

export default {
  controller: LoginRedirect,
};
