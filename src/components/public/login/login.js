/**
 * Login redirect controller to send auth to keycloak
 * @param {*} keycloakAuth - Keycloak authentication factory
 * @param {*} $user - User info factory
 * @param {*} $acl - Acl factory
 * @param {*} $state {@link https://github.com/angular-ui/ui-router/wiki/quick-reference}
 * @param {*} $mdToast {@link https://material.angularjs.org/latest/api/service/$mdToast}
 * @param {*} $localStorage {@link https://github.com/gsklee/ngStorage}
 * @return {*} None
 */
function loginRedirect(keycloakAuth, $user, $acl, $state, $mdToast, $localStorage) {
  keycloakAuth.setToken()
    .then(() => {
      $user.me()
        .then((response) => {
          $acl.injectUser(response);
          if ($localStorage.returnToState) {
            // navigate to state user was trying to access
            $state.go($localStorage.returnToState, JSON.parse($localStorage.returnToStateParams));
            $localStorage.returnToState = undefined;
            $localStorage.returnToStateParams = undefined;
            return;
          }
          if ($acl.inGroup('clinician')) {
            $state.go('dashboard.reports.genomic');
          } else {
            $state.go('dashboard.reports.dashboard');
          }
        });
    }).catch((err) => {
      $mdToast.showSimple('Error with login server. Try again later.');
    });
}

loginRedirect.$inject = ['keycloakAuth', 'api.user', '$acl', '$state', '$mdToast', '$localStorage'];

angular
  .module('bcgscIPR')
  .controller('controller.public.login', loginRedirect);
