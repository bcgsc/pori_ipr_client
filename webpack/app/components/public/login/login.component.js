export default {
  controller: class loginRedirect {
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
        this.$state.go(
          this.$localStorage.returnToState, JSON.parse(this.$localStorage.returnToStateParams),
        );
        delete this.$localStorage.returnToState;
        delete this.$localStorage.returnToStateParams;
      } else {
        this.$state.go('root.reportlisting.dashboard');
      }
    }
  },
};
