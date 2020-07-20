import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import { getAppendices, getTcgaAcronyms } from '@/services/reports/appendices';
import lazyInjector from '@/lazyInjector';
import template from './appendices.pug';
import columnDefs from './columnDefs';
import './index.scss';

const bindings = {
  report: '<',
  print: '<',
  probe: '<',
  theme: '<',
};

class Appendices {
  $onInit() {
    this.sampleInformationColumnDefs = columnDefs.sampleInformationColumnDefs;
    this.sequencingProtocolInformationColumnDefs = columnDefs.sequencingProtocolInformationColumnDefs;
    this.tcgaAcronymsColumnDefs = columnDefs.tcgaAcronymsColumnDefs;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      const promises = Promise.all([
        getAppendices(this.report.ident),
        getTcgaAcronyms(this.report.ident),
      ]);

      const [appendices, tcgaAcronyms] = await promises;

      this.appendices = appendices;
      this.tcgaAcronyms = tcgaAcronyms;

      this.configSplit = this.appendices.config.split('\n');
      this.config = this.appendices.config;
      this.seqQC = this.appendices.seqQC;
      this.sampleInfo = this.appendices.sampleInfo;
      $rootScope.$digest();
    }
  }
}

export const AppendicesComponent = {
  template,
  controller: Appendices,
  bindings,
};

export default angular2react('appendices', AppendicesComponent, lazyInjector.$injector);
