import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import CopyNumberService from '@/services/reports/copy-number.service';
import ImageService from '@/services/reports/image.service';
import lazyInjector from '@/lazyInjector';

import template from './copy-number-analyses.pug';
import columnDefs from './columnDefs';
import { CNVSTATE, EXPLEVEL } from '@/constants';

import './index.scss';

const bindings = {
  report: '<',
  theme: '<',
};

class CopyNumberAnalyses {
  $onInit() {
    this.columnDefs = columnDefs;
    this.titleMap = {
      clinical: 'CNVs of Potential Clinical Relevance',
      nostic: 'CNVs of Prognostic or Diagnostic Relevance',
      biological: 'CNVs of Biological Relevance',
      commonAmplified: 'Commonly Amplified Oncogenes with Copy Gains',
      homodTumourSupress: 'Homozygously Deleted Tumour Suppresors',
      highlyExpOncoGain: 'Highly Expressed Oncogenes with Copy Gains',
      lowlyExpTSloss: 'Lowly Expressed Tumour Suppressors with Copy Losses',
    };
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      const promises = Promise.all([
        ImageService.get(
          this.report.ident,
          'cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5',
        ),
        CopyNumberService.all(this.report.ident),
      ]);

      const [images, cnvs] = await promises;
      this.images = images;
      this.cnvs = cnvs;

      this.cnvGroups = this.groupCnvs(this.cnvs);
      this.loading = false;
      $rootScope.$digest();
    }
  }

  groupCnvs(cnvs) {
    const cnvGroups = {
      clinical: [],
      nostic: [],
      biological: [],
      commonAmplified: [],
      homodTumourSupress: [],
      highlyExpOncoGain: [],
      lowlyExpTSloss: [],
    };

    for (const row of Object.values(cnvs)) {
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
          cnvGroups.homodTumourSupress.push(row);
        }
        // low exp, copy loss
        if (CNVSTATE.LOSS.includes(cnvState) && EXPLEVEL.OUT_LOW.includes(cnvState)) {
          cnvGroups.lowlyExpTSloss.push(row);
        }
      }

      if (oncogene) {
        // Common amplified + Copy gains?
        if (CNVSTATE.AMP.includes(cnvState)) {
          cnvGroups.commonAmplified.push(row);
        }
        // Highly expressed + Copy gains?
        if (CNVSTATE.GAIN.includes(cnvState) && EXPLEVEL.OUT_HIGH.includes(expressionState)) {
          cnvGroups.highlyExpOncoGain.push(row);
        }
      }

      // KB-matches
      // Therapeutic? => clinical
      if (row.kbMatches.some(m => m.category === 'therapeutic')) {
        cnvGroups.clinical.push(row);
      }

      // Diagnostic || Prognostic? => nostic
      if (row.kbMatches.some(m => m.category === 'diagnostic' || m.category === 'prognostic')) {
        cnvGroups.nostic.push(row);
      }

      // Biological ? => Biological
      if (row.kbMatches.some(m => m.category === 'biological')) {
        cnvGroups.biological.push(row);
      }
    }
    return cnvGroups;
  }
}

export const CopyNumberComponent = {
  template,
  bindings,
  controller: CopyNumberAnalyses,
};

export default angular2react('copyNumber', CopyNumberComponent, lazyInjector.$injector);
