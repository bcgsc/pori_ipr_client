/**
 * Login redirect controller to send auth to keycloak
 * @param {*} keycloakAuth - Keycloak authentication factory
 * @param {*} $user - User info factory
 * @param {*} $state {@link https://github.com/angular-ui/ui-router/wiki/quick-reference}
 * @param {*} $mdToast {@link https://material.angularjs.org/latest/api/service/$mdToast}
 * @param {*} $localStorage {@link https://github.com/gsklee/ngStorage}
 * @return {*} None
 */
function loginRedirect(keycloakAuth, $user, $state, $mdToast, $localStorage) {
  this.$onInit = async () => {
    try {
      await keycloakAuth.setToken();
      const resp = await $user.me();
      $localStorage.expiry = resp.expiry;
      if ($localStorage.returnToState) {
        // navigate to state user was trying to access
        $state.go($localStorage.returnToState, $localStorage.returnToStateParams);
        delete $localStorage.returnToState;
        delete $localStorage.returnToStateParams;
      } else {
        $state.go('dashboard.reports.dashboard');
      }
    } catch (err) {
      if (err.status !== 403) {
        $mdToast.showSimple('Error with login server. Try again later.');
      }
    }
  };
}

loginRedirect.$inject = ['keycloakAuth', 'api.user', '$state', '$mdToast', '$localStorage'];

angular
  .module('bcgscIPR')
  .controller('controller.public.login', loginRedirect);
