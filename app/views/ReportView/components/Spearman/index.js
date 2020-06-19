import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import lazyInjector from '@/lazyInjector';
import ImageService from '@/services/reports/image.service';
import template from './spearman.pug';
import './index.scss';

const bindings = {
  report: '<',
};

class Spearman {
  $onInit() {
    // Convert full hex to 6chr
    this.colourHex = hex => hex.match(/([A-z0-9]{6}$)/)[0];
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.images = await ImageService.get(
        this.report.ident,
        'expression.chart,expression.legend',
      );
      $rootScope.$digest();
    }
  }
}

export const SpearmanComponent = {
  template,
  bindings,
  controller: Spearman,
};

export default angular2react('spearman', SpearmanComponent, lazyInjector.$injector);
