import template from './copy-number-analyses.pug';
import columnDefs, { setHeaderName } from './columnDefs';
import './copy-number-analyses.scss';
import { CNVSTATE, EXPLEVEL } from '../constants';

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
    setHeaderName(`${this.report.tumourAnalysis.diseaseExpressionComparator || ''} %ile`, 'tcgaPerc');
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

    for (const row of Object.values(this.cnvs)) {
      const {
        gene: {
          tumourSuppressor,
          oncogene,
          expressionVariants: { expressionState },
        },
      } = row; // Get the flags for this cnv

      let { cnvState } = row;

      cnvState = cnvState.toLowerCase();

      if (tumourSuppressor) {
        // homod?
        if (CNVSTATE.HOMLOSS.includes(cnvState)) {
          this.cnvGroups.homodTumourSupress.push(row);
        }
        // low exp, copy loss
        if (CNVSTATE.LOSS.includes(cnvState) && EXPLEVEL.OUT_LOW.includes(cnvState)) {
          this.cnvGroups.lowlyExpTSloss.push(row);
        }
      }

      if (oncogene) {
        // Common amplified + Copy gains?
        if (CNVSTATE.AMP.includes(cnvState)) {
          this.cnvGroups.commonAmplified.push(row);
        }
        // Highly expressed + Copy gains?
        if (CNVSTATE.GAIN.includes(cnvState) && EXPLEVEL.OUT_HIGH.includes(expressionState)) {
          this.cnvGroups.highlyExpOncoGain.push(row);
        }
      }

      // KB-matches
      // Therapeutic? => clinical
      if (row.kbMatches.some(m => m.category === 'therapeutic')) {
        this.cnvGroups.clinical.push(row);
      }

      // Diagnostic || Prognostic? => nostic
      if (row.kbMatches.some(m => m.category === 'diagnostic' || m.category === 'prognostic')) {
        this.cnvGroups.nostic.push(row);
      }

      // Biological ? => Biological
      if (row.kbMatches.some(m => m.category === 'biological')) {
        this.cnvGroups.biological.push(row);
      }
    }
  }
}

export default {
  template,
  bindings,
  controller: CopyNumberAnalyses,
};
