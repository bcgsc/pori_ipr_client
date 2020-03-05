import template from './appendices.pug';
import './appendices.scss';

const bindings = {
  report: '<',
  tcgaAcronyms: '<',
  print: '<',
  probe: '<',
};

class AppendicesComponent {
  $onInit() {
    this.config = this.report.config.split('\n');
  }
}

export default {
  template,
  controller: AppendicesComponent,
  bindings,
};
