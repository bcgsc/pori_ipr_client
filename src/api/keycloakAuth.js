/**
 * Keycloak authentication factory
 * @param {*} $q {@link https://docs.angularjs.org/api/ng/service/$q}
 * @param {*} $cookies {@link https://docs.angularjs.org/api/ngCookies/service/$cookies}
 * @param {*} $state {@link https://github.com/angular-ui/ui-router/wiki/quick-reference}
 * @param {*} $http {@link https://docs.angularjs.org/api/ng/service/$http}
 * @return {Object} Auth factory
 */
function keycloakAuth($q, $cookies, $state, $http) {
  const keycloak = Keycloak({
    'realm': 'CanDIG',
    'clientId': 'IPR',
    'url': CONFIG.ENDPOINTS.KEYCLOAK,
  });

  /**
   * Login using the keycloak adaptor
   * @return {Promise} Promise to keycloak auth
   */
  async function setToken() {
    try {
      await keycloak.init({ onLoad: 'login-required' });
      $cookies.put(CONFIG.COOKIES.KEYCLOAK, keycloak.token);
      return keycloak.token;
    } catch (err) {
      return err;
    }
  }

  /**
   * Returns the token that has been set
   * @return {String|undefined} Token string
   */
  function getToken() {
    return $cookies.get(CONFIG.COOKIES.KEYCLOAK);
  }

  /**
   * Logs the user out via Keycloak
   * @return {Promise} Promise for kc logout
   */
  async function logout() {
    try {
      await keycloak.init();
      $cookies.remove(CONFIG.COOKIES.KEYCLOAK);
      const resp = await keycloak.logout({
        redirectUri: $state.href('public.login', {}, { absolute: true }),
      });
      return resp;
    } catch (err) {
      $cookies.remove(CONFIG.COOKIES.KEYCLOAK);
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

keycloakAuth.$inject = ['$q', '$cookies', '$state', '$http'];

angular
  .module('bcgscIPR')
  .factory('keycloakAuth', keycloakAuth);
