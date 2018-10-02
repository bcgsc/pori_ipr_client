/**
 * Keycloak authentication factory
 */
function keycloakAuth($user, $q) {
  let idToken = '';
  /**
   * Login using the keycloak adaptor
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
          console.log(keycloak);
          if (response) {
            idToken = keycloak.idToken;
            resolve(idToken);
          }
          reject();
        });
    });
  }

  /**
   * Returns the token that has been set
   */
  function getToken() {
    return idToken;
  }

  const keycloakAuthService = {
    setToken: setToken,
    getToken: getToken,
  };
  return keycloakAuthService;
}

keycloakAuth.$inject = ['api.user', '$q'];

angular
  .module('bcgscIPR')
  .factory('keycloakAuth', keycloakAuth);
