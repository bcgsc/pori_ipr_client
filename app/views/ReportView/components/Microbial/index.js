import { angular2react } from 'angular2react';

import ImageService from '@/services/reports/image.service';
import lazyInjector from '@/lazyInjector';
import template from './microbial.pug';
import './index.scss';

const bindings = {
  report: '<',
};

class Microbial {
  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.images = await ImageService.get(
        this.report.ident,
        'microbial.circos.transcriptome,microbial.circos.genome,microbial.circos',
      );
    }
  }
}

export const MicrobialComponent = {
  template,
  controller: Microbial,
  bindings,
};

export default angular2react('microbial', MicrobialComponent, lazyInjector.$injector);
