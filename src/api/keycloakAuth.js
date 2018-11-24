/**
 * Keycloak authentication factory
 * @param {*} $q {@link https://docs.angularjs.org/api/ng/service/$q}
 * @param {*} $localStorage {@link https://github.com/gsklee/ngStorage}
 * @param {*} $state {@link https://github.com/angular-ui/ui-router/wiki/quick-reference}
 * @param {*} $http {@link https://docs.angularjs.org/api/ng/service/$http}
 * @return {Object} Auth factory
 */
function keycloakAuth($q, $localStorage, $state, $http) {
  const keycloak = Keycloak({
    'realm': CONFIG.SSO.REALM,
    'clientId': 'IPR',
    'url': CONFIG.ENDPOINTS.KEYCLOAK,
  });

  /**
   * Login using the keycloak adaptor
   * @return {Promise} Promise to keycloak auth
   */
  async function setToken() {
    await keycloak.init({ onLoad: 'login-required', promiseType: 'native' })
    $localStorage[CONFIG.STORAGE.KEYCLOAK] = keycloak.token;
    return keycloak.token;
  }

  /**
   * Returns the token that has been set
   * @return {String|undefined} Token string
   */
  function getToken() {
    try {
      return $localStorage[CONFIG.STORAGE.KEYCLOAK];
    } catch (err) {
      return false;
    }
  }

  /**
   * Logs the user out via Keycloak
   * @return {Promise} Promise for kc logout
   */
  async function logout() {
    try {
      await keycloak.init();
      delete $localStorage[CONFIG.STORAGE.KEYCLOAK];
      const resp = await keycloak.logout({
        redirectUri: $state.href('public.login', {}, { absolute: true }),
      });
      return resp;
    } catch (err) {
      delete $localStorage[CONFIG.STORAGE.KEYCLOAK];
      delete $http.headers.Authorization;
      $state.go('public.login');
      return err;
    }
  }

  const keycloakAuthService = {
    setToken: setToken,
    getToken: getToken,
    logout: logout,
  };
  return keycloakAuthService;
}

keycloakAuth.$inject = ['$q', '$localStorage', '$state', '$http'];

angular
  .module('bcgscIPR')
  .factory('keycloakAuth', keycloakAuth);
