import template from './tumour-content.pug';
import './tumour-content.scss';

const bindings = {
  tc: '<',
};

class TumourContentComponent {
  $onInit() {
    this.colourCode = Math.round(((this.tc === 'ND') ? 200 : this.tc) / 5) * 5;
    this.className = `tc-${this.colourCode}`;
  }
}

export default {
  template,
  bindings,
  controller: TumourContentComponent,
};
