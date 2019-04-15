import template from './spearman.pug';
import './spearman.scss';

const bindings = {
  images: '<',
  report: '<',
};

class SpearmanComponent {
  $onInit() {
    // Convert full hex to 6chr
    this.colourHex = (hex) => {
      return hex.match(/([A-z0-9]{6}$)/)[0];
    };
  }
}

export default {
  template,
  bindings,
  controller: SpearmanComponent,
};
