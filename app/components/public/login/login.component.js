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
    try {
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
        this.$state.go('root.home');
      }
    } catch (err) {
      console.error(err);
      if (err.data.message === 'IPR Access Error') {
        return this.$state.go('public.access');
      }
      this.$mdToast.show(
        this.$mdToast.simple('No response from the server. Please try again later').hideDelay(7000),
      );
    }
  }
}

export default {
  controller: LoginRedirect,
};
