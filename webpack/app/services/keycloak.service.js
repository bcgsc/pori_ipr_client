import Keycloak from 'keycloak-js';

class KeycloakService {
  /* @ngInject */
  constructor($localStorage, $state, $http) {
    this.$localStorage = $localStorage;
    this.$state = $state;
    this.$http = $http;
    this.keycloak = Keycloak({
      'realm': CONFIG['jdavies-local'].SSO.REALM,
      'clientId': 'IPR',
      'url': CONFIG['jdavies-local'].ENDPOINTS.KEYCLOAK,
    });
  }

  /**
   * Login using the keycloak adaptor
   * @return {Promise} Promise to keycloak auth
   */
  async setToken() {
    await this.keycloak.init({ onLoad: 'login-required', promiseType: 'native' });
    this.$localStorage[CONFIG['jdavies-local'].STORAGE.KEYCLOAK] = this.keycloak.token;
    return this.keycloak.token;
  }

  /**
   * Returns the token that has been set
   * @return {String|undefined} Token string
   */
  async getToken() {
    try {
      return this.$localStorage[CONFIG['jdavies-local'].STORAGE.KEYCLOAK];
    } catch (err) {
      return false;
    }
  }

  /**
   * Logs the user out via Keycloak
   * @return {Promise} Promise for kc logout
   */
  async logout() {
    try {
      await this.keycloak.init({ promiseType: 'native' });
      delete this.$localStorage[CONFIG['jdavies-local'].STORAGE.KEYCLOAK];
      const resp = await this.keycloak.logout({
        redirectUri: this.$state.href('public.login', {}, { absolute: true }),
      });
      return resp;
    } catch (err) {
      delete this.$localStorage[CONFIG['jdavies-local'].STORAGE.KEYCLOAK];
      delete this.$http.headers.Authorization;
      this.$state.go('public.login');
      return err;
    }
  }
}

export default KeycloakService;
