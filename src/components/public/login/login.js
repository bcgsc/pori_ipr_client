/**
 * Login redirect controller to send auth to keycloak
 * @param {*} keycloakAuth - Keycloak authentication factory
 * @param {*} $user - User info factory
 * @param {*} $acl - Acl factory
 * @param {*} $state {@link https://github.com/angular-ui/ui-router/wiki/quick-reference}
 * @param {*} $rootScope {@link https://docs.angularjs.org/api/ng/service/$rootScope}
 * @param {*} $mdToast {@link https://material.angularjs.org/latest/api/service/$mdToast}
 * @return {*} None
 */
function loginRedirect(keycloakAuth, $user, $acl, $state, $rootScope, $mdToast) {
  keycloakAuth.setToken()
    .then(() => {
      $user.me()
        .then((response) => {
          $acl.injectUser(response);
          if ($rootScope.returnToState) {
            // navigate to state user was trying to access
            $state.go($rootScope.returnToState, $rootScope.returnToStateParams);
            $rootScope.returnToState = undefined;
            $rootScope.returnToStateParams = undefined;
            return;
          }
          if ($acl.inGroup('clinician')) {
            $state.go('dashboard.reports.genomic');
          } else {
            $state.go('dashboard.reports.dashboard');
          }
        });
    }).catch(() => {
      $mdToast.showSimple('Error with login server. Try again later.');
    });
}

loginRedirect.$inject = ['keycloakAuth', 'api.user', '$acl', '$state', '$rootScope', '$mdToast'];

angular
  .module('bcgscIPR')
  .controller('controller.public.login', loginRedirect);
