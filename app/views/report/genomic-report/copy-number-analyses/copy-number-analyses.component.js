import template from './copy-number-analyses.pug';
import columnDefs, { setHeaderName } from './columnDefs';
import './copy-number-analyses.scss';
import { CNVSTATE, EXPLEVEL } from '../consts';

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
      let { 
        gene: { tumourSuppressor, oncogene, 
          expressionVariants: { expression_class }
        }, 
        cnvState, 
      } = row; // Get the flags for this cnv

      if (tumourSuppressor) {
        // homod?
        if (cnvState === CNVSTATE.HOMLOSS) {
          this.cnvGroups.homodTumourSupress.push(row);
        }
        // low exp, copy loss
        if (cnvState === CNVSTATE.LOSS && expression_class === EXPLEVEL.OUT_LOW) {
          this.cnvGroups.lowlyExpTSloss.push(row);
        }
      }

      if (oncogene) {
        // Common amplified + Copy gains?
        if (
          cnvState === CNVSTATE.AMP
        ) {
          this.cnvGroups.commonAmplified.push(row);
        }
        // Highly expressed + Copy gains?
        if (
          cnvState === CNVSTATE.GAIN &&
          (expression_class === EXPLEVEL.OUT_HIGH || expression_class === EXPLEVEL.OVEREXPRESSED)
        ) {
          this.cnvGroups.highlyExpOncoGain.push(row);
        }
      }

      // TODO: Clinical, nostic, biological
    });
  }
}

export default {
  template,
  bindings,
  controller: CopyNumberAnalyses,
};
