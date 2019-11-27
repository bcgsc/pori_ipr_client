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
        const { returnToState, returnToStateParams } = $localStorage;
        delete $localStorage.returnToState;
        delete $localStorage.returnToStateParams;
        if (!Object.is(returnToStateParams, { '#': null })) {
          $state.go(
            returnToState, returnToStateParams,
          );
        } else {
          $state.go(
            returnToState,
          );
        }
      } else {
        $state.go('dashboard.reports.dashboard');
      }
    } catch (err) {
      try {
        if (err.status !== 403) {
          $mdToast.showSimple('Error with login server. Try again later.');
        } else {
          delete $localStorage.returnToState;
          delete $localStorage.returnToStateParams;
          await keycloakAuth.logout();
        }
      } catch (e) {
        delete $localStorage.returnToState;
        delete $localStorage.returnToStateParams;
        await keycloakAuth.logout();
      }
    }
  };
}

loginRedirect.$inject = ['keycloakAuth', 'api.user', '$state', '$mdToast', '$localStorage'];

angular
  .module('bcgscIPR')
  .controller('controller.public.login', loginRedirect);
