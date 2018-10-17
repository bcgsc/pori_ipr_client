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
    'url': 'http://ga4ghdev01.bcgsc.ca:8080/auth',
  });

  /**
   * Login using the keycloak adaptor
   * @return {Promise} Promise to keycloak auth
   */
  function setToken() {
    return $q((resolve, reject) => {
      keycloak.init({ onLoad: 'login-required' })
        .then(() => {
          $cookies.put(CONFIG.COOKIES.KEYCLOAK, keycloak.token);
          resolve(keycloak.token);
        })
        .catch((err) => {
          reject(err);
        });
    });
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
  function logout() {
    return $q((resolve, reject) => {
      keycloak.init()
        .then(() => {
          $cookies.remove(CONFIG.COOKIES.KEYCLOAK);
          keycloak.logout({
            redirectUri: $state.href('public.login', {}, { absolute: true }),
          })
            .then((resp) => {
              resolve(resp);
            });
        })
        .catch((err) => {
          $cookies.remove(CONFIG.COOKIES.KEYCLOAK);
          delete $http.headers.Authorization;
          $state.go('public.login');
          reject(err);
        });
    });
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
