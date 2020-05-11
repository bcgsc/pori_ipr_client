import template from './appendices.pug';
import columnDefs from './columnDefs';
import './appendices.scss';

const bindings = {
  report: '<',
  tcgaAcronyms: '<',
  print: '<',
  probe: '<',
  appendices: '<',
};

class AppendicesComponent {
  $onInit() {
    this.sampleInformationColumnDefs = columnDefs.sampleInformationColumnDefs;
    this.sequencingProtocolInformationColumnDefs = columnDefs.sequencingProtocolInformationColumnDefs;
    this.tcgaAcronymsColumnDefs = columnDefs.tcgaAcronymsColumnDefs;

    this.configSplit = this.appendices.config.split('\n');
    this.config = this.appendices.config;
    this.seqQC = this.appendices.seqQC;
    this.sampleInfo = this.appendices.sampleInfo;
  }
}

export default {
  template,
  controller: AppendicesComponent,
  bindings,
};
