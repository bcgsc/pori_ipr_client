import template from './access.pug';
import './access.scss';

class AccessComponent {
  /* @ngInject */
  constructor(KeycloakService) {
    this.KeycloakService = KeycloakService;
  }

  async logout() {
    return this.KeycloakService.logout();
  }
}

export default {
  template,
  controller: AccessComponent,
};
