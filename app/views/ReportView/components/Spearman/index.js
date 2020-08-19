import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import lazyInjector from '@/lazyInjector';
import { getComparators } from '@/services/reports/comparators';
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
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.images = await ImageService.get(
        this.report.ident,
        'expression.chart,expression.legend',
      );
      const comparators = await getComparators(this.report.ident);

      const normalComparator = comparators.find(({ analysisRole }) => analysisRole === 'expression (primary site)');
      const diseaseComparator = comparators.find(({ analysisRole }) => analysisRole === 'expression (disease)');

      this.normalComparator = normalComparator ? normalComparator.name : 'Not specified';
      this.diseaseComparator = diseaseComparator ? diseaseComparator.name : 'Not specified';

      this.loading = false;
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
