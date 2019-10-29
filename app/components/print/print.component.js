import template from './print.pug';
import './print.scss';

const bindings = {
  pog: '<',
  report: '<',
};

class PrintComponent {
  /* @ngInject */
  constructor($window) {
    this.$window = $window;
  }

  $onInit() {
    // This looks odd but it's the only way to simulate a postLink lifecycle method
    // Where all the template is bound to variables
    angular.element(() => this.$window.print());
  }
}


export default {
  template,
  bindings,
  controller: PrintComponent,
};
