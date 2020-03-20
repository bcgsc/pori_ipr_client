import template from './copy-number-analyses.pug';
import columnDefs, { setHeaderName } from './columnDefs';
import './copy-number-analyses.scss';

const bindings = {
  report: '<',
  mutationSummary: '<',
  images: '<',
  cnvs: '<',
};

class CopyNumberAnalyses {
  /* @ngInject */
  constructor(SmallMutationsService) {
    this.SmallMutationsService = SmallMutationsService;
  }

  $onInit() {
    setHeaderName(`${this.report.tumourAnalysis.diseaseExpressionComparator} %ile`, 'tcgaPerc');
    setHeaderName(`Fold Change vs ${this.report.tumourAnalysis.normalExpressionComparator}`, 'foldChange');
    this.columnDefs = columnDefs;
    this.cnvGroups = {
      clinical: [],
      nostic: [],
      biological: [],
      commonAmplified: [],
      homodTumourSupress: [],
      highlyExpOncoGain: [],
      lowlyExpTSloss: [],
    };

    this.titleMap = {
      clinical: 'CNVs of Potential Clinical Relevance',
      nostic: 'CNVs of Prognostic or Diagnostic Relevance',
      biological: 'CNVs of Biological Relevance',
      commonAmplified: 'Commonly Amplified Oncogenes with Copy Gains',
      homodTumourSupress: 'Homozygously Deleted Tumour Suppresors',
      highlyExpOncoGain: 'Highly Expressed Oncogenes with Copy Gains',
      lowlyExpTSloss: 'Lowly Expressed Tumour Suppressors with Copy Losses',
    };

    Object.values(this.cnvs).forEach((row) => {
      if (row.cnvVariant) {
        if (!Object.prototype.hasOwnProperty.call(this.cnvGroups, row.cnvVariant)) {
          this.cnvGroups[row.cnvVariant] = [];
        }
        // Add row to type
        this.cnvGroups[row.cnvVariant].push(row);
      }
    });
  }
}

export default {
  template,
  bindings,
  controller: CopyNumberAnalyses,
};
