
import template from './root.pug';

class RootComponent {
  /* @ngInject */
  constructor($rootScope) {
    this.$rootScope = $rootScope;
    this.$rootScope.showLoader = false;
  }
}

export default {
  template,
  controller: RootComponent,
};
