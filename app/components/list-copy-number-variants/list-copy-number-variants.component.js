import template from './list-copy-number-variants.pug';

const bindings = {
  cnvs: '<',
  report: '<',
};

class ListCopyNumberVariantsComponent {
  /* eslint-disable-next-line class-methods-use-this */
  copyFilter(copyChange) {
    return copyChange.match(/(((\+|-)?)[0-9]{1,2})/g)[0];
  }
}

export default {
  template,
  bindings,
  controller: ListCopyNumberVariantsComponent,
};
