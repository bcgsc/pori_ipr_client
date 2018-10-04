/**
 * Keycloak authentication factory
 * @param {*} $user - $user factory
 * @param {*} $q {@link https://docs.angularjs.org/api/ng/service/$q}
 * @param {*} $cookies {@link https://docs.angularjs.org/api/ngCookies/service/$cookies}
 * @return {Object} Auth factory
 */
function keycloakAuth($user, $q, $cookies) {
  /**
   * Login using the keycloak adaptor
   * @return {Promise} Promise to keycloak auth
   */
  function setToken() {
    const keycloak = Keycloak({
      'realm': 'CanDIG',
      'clientId': 'IPR',
      'url': 'http://ga4ghdev01.bcgsc.ca:8080/auth',
    });
    return $q((resolve, reject) => {
      keycloak.init({ onLoad: 'login-required' })
        .then((response) => {
          if (response) {
            $cookies.put('BCGSC_SSO', keycloak.idToken);
            resolve(keycloak.idToken);
          }
          reject();
        });
    });
  }

  /**
   * Returns the token that has been set
   * @return {String|undefined} Token string
   */
  function getToken() {
    return $cookies.get('BCGSC_SSO');
  }

  const keycloakAuthService = {
    setToken: setToken,
    getToken: getToken,
  };
  return keycloakAuthService;
}

keycloakAuth.$inject = ['api.user', '$q', '$cookies'];

angular
  .module('bcgscIPR')
  .factory('keycloakAuth', keycloakAuth);
