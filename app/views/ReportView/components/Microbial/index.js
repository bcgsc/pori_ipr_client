import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import ImageService from '@/services/reports/image.service';
import lazyInjector from '@/lazyInjector';
import template from './microbial.pug';
import './index.scss';

const bindings = {
  report: '<',
};

class Microbial {
  $onInit() {
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.images = await ImageService.get(
        this.report.ident,
        'microbial.circos.transcriptome,microbial.circos.genome,microbial.circos',
      );
      this.loading = false;
      $rootScope.$digest();
    }
  }
}

export const MicrobialComponent = {
  template,
  controller: Microbial,
  bindings,
};

export default angular2react('microbial', MicrobialComponent, lazyInjector.$injector);
