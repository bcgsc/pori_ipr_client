class LoginRedirect {
  /* @ngInject */
  constructor(KeycloakService, UserService, $state, $mdToast, $localStorage) {
    this.KeycloakService = KeycloakService;
    this.UserService = UserService;
    this.$state = $state;
    this.$mdToast = $mdToast;
    this.$localStorage = $localStorage;
  }

  async $onInit() {
    await this.KeycloakService.setToken();
    const resp = await this.UserService.me();
    this.$localStorage.expiry = resp.expiry;
    if (this.$localStorage.returnToState) {
      // navigate to state user was trying to access
      if (!Object.is(this.$localStorage.returnToStateParams, { '#': null })) {
        this.$state.go(
          this.$localStorage.returnToState, this.$localStorage.returnToStateParams,
        );
      } else {
        this.$state.go(
          this.$localStorage.returnToState,
        );
      }
      delete this.$localStorage.returnToState;
      delete this.$localStorage.returnToStateParams;
    } else {
      this.$state.go('root.reportlisting.dashboard');
    }
  }
}

export default {
  controller: LoginRedirect,
};
