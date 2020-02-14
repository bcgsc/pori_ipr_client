import template from './small-mutation-variants.pug';
import './small-mutation-variants.scss';

const bindings = {
  mutations: '<',
  pog: '<',
  report: '<',
};

class SmallMutationVariantsComponent {
  /* @ngInject */
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
    this.clicked = false;
  }

  /* eslint-disable-next-line class-methods-use-this */
  copyFilter(copyChange) {
    if (copyChange) {
      return (copyChange === 'na') ? 'na' : copyChange.match(/(((\+|-)?)[0-9]{1,2})/g)[0];
    }
    return null;
  }
}

export default {
  template,
  bindings,
  controller: SmallMutationVariantsComponent,
};
