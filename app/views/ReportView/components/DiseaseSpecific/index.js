import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import ImageService from '@/services/reports/image.service';
import lazyInjector from '@/lazyInjector';
import template from './disease-specific-analysis.pug';
import './index.scss';

const bindings = {
  report: '<',
};

class DiseaseSpecific {
  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.images = await ImageService.get(
        this.report.ident,
        'microbial.circos',
      );
      this.subtypePlotImages = await ImageService.subtypePlots(this.report.ident);
      this.hasSubtypePlot = !(Object.keys(this.subtypePlotImages).length === 0);
      $rootScope.$digest();
    }
  }
}

export const DiseaseSpecificComponent = {
  template,
  bindings,
  controller: DiseaseSpecific,
};

export default angular2react('diseaseSpecific', DiseaseSpecificComponent, lazyInjector.$injector);