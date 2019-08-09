import template from './root.pug';

const bindings = {
  isAdmin: '<',
  user: '<',
};

class RootComponent {
  /* @ngInject */
  constructor($rootScope) {
    this.$rootScope = $rootScope;
  }

  async $onInit() {
    this.$rootScope.showLoader = false;
  }
}

export default {
  template,
  bindings,
  controller: RootComponent,
};
