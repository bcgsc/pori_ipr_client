import template from './disease-specific-analysis.pug';

const bindings = {
  pog: '<',
  images: '<',
  subtypePlotImages: '<',
};

class DiseaseSpecificAnalysisComponent {
  $onInit() {
    // Load Subtype Plot Images into template
    this.hasSubtypePlot = !(Object.keys(this.subtypePlotImages).length === 0);
  }
}

export default {
  template,
  bindings,
  controller: DiseaseSpecificAnalysisComponent,
};
