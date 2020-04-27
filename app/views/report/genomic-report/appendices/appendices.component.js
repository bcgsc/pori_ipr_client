import template from './appendices.pug';
import columnDefs from './columnDefs';
import './appendices.scss';

const bindings = {
  report: '<',
  tcgaAcronyms: '<',
  print: '<',
  probe: '<',
};

class AppendicesComponent {
  $onInit() {
    this.sampleInformationColumnDefs = columnDefs.sampleInformationColumnDefs;
    this.sequencingProtocolInformationColumnDefs = columnDefs.sequencingProtocolInformationColumnDefs;
    this.tcgaAcronymsColumnDefs = columnDefs.tcgaAcronymsColumnDefs;
    this.config = this.report.config.split('\n');
  }
}

export default {
  template,
  controller: AppendicesComponent,
  bindings,
};
