import Keycloak from 'keycloak-js';
import { StateService as $state } from '@uirouter/angularjs';
import { $http } from 'ngimport';

class KeycloakService {
  /* @ngInject */
  constructor($localStorage, $state, $http) {
    this.$localStorage = $localStorage;
    this.$state = $state;
    this.$http = $http;
    this.keycloak = Keycloak({
      'realm': CONFIG.SSO.REALM,
      'clientId': 'IPR',
      'url': CONFIG.ENDPOINTS.KEYCLOAK,
    });
  }

  /**
   * Login using the keycloak adaptor
   * @return {Promise} Promise to keycloak auth
   */
  async setToken() {
    await this.keycloak.init({ onLoad: 'login-required' });
    this.$localStorage[CONFIG.STORAGE.KEYCLOAK] = this.keycloak.token;
    return this.keycloak.token;
  }

  /**
   * Returns the token that has been set
   * @return {String|undefined} Token string
   */
  async getToken() {
    try {
      return this.$localStorage[CONFIG.STORAGE.KEYCLOAK];
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
      await this.keycloak.init();
      delete this.$localStorage[CONFIG.STORAGE.KEYCLOAK];
      await this.keycloak.logout({
        redirectUri: this.$state.href('public.login', {}, { absolute: true }),
      });
    } catch (err) {
      delete this.$localStorage[CONFIG.STORAGE.KEYCLOAK];
      delete this.$http.headers.Authorization;
      this.$state.go('public.login');
      return err;
    }
  }
}

export default KeycloakService;

const keycloak = Keycloak({
  'realm': CONFIG.SSO.REALM,
  'clientId': 'IPR',
  'url': CONFIG.ENDPOINTS.KEYCLOAK,
});

export const login = async () => {
  await keycloak.init({ onLoad: 'login-required' });
  localStorage[CONFIG.STORAGE.KEYCLOAK] = keycloak.token;
  return keycloak.token;
};

export const logout = async () => {
  try {
    await keycloak.init();
    delete localStorage[CONFIG.STORAGE.KEYCLOAK];
    await keycloak.logout({
      redirectUri: $state.href('public.login', {}, { absolute: true }),
    });
  } catch (err) {
    delete localStorage[CONFIG.STORAGE.KEYCLOAK];
    delete $http.headers.Authorization;
    $state.go('public.login');
    return err;
  }
};

export const getToken = async () => {
  try {
    return localStorage[CONFIG.STORAGE.KEYCLOAK];
  } catch (err) {
    return false;
  }
};
