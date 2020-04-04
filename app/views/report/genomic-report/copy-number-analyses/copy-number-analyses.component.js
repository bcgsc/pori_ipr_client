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

    let cnvRows = Object.values(this.cnvs);
    let row;
    for (let i = 0; i < cnvRows.length; i++) {
      row = cnvRows[i];
      let {
        gene: { 
          tumourSuppressor, 
          oncogene,
          expressionVariants: { expression_class: expLvl }
        },
        cnvState,
      } = row; // Get the flags for this cnv

      if (tumourSuppressor) {
        // homod?
        if (cnvState === CNVSTATE.HOMLOSS) {
          this.cnvGroups.homodTumourSupress.push(row);
        }
        // low exp, copy loss
        if (cnvState === CNVSTATE.LOSS && expLvl === EXPLEVEL.OUT_LOW) {
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
          (EXPLEVEL.UP.includes(expLvl))
        ) {
          this.cnvGroups.highlyExpOncoGain.push(row);
        }
      }

      // KB-matches 
      // Therapeutic? => clinical
      if (row.kbMatches.some(m => m.category === 'therapeutic')) {
        this.cnvGroups.clinical.push(row);
        continue;
      }

      // Diagnostic || Prognostic? => nostic
      if (row.kbMatches.some(m => m.category === 'diagnostic' || m.category === 'prognostic')) {
        this.cnvGroups.nostic.push(row);
        continue;
      }

      // Biological ? => Biological
      if (row.kbMatches.some(m => m.category === 'biological')) {
        this.cnvGroups.biological.push(row);
        continue;
      }
    }
  }
}

export default {
  template,
  bindings,
  controller: CopyNumberAnalyses,
};
