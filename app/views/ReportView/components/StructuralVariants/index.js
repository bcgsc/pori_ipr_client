import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import MavisService from '@/services/reports/mavis.service';
import StructuralVariantsService from '@/services/reports/structural-variants.service';
import lazyInjector from '@/lazyInjector';

import template from './structural-variants.pug';
import columnDefs from './columnDefs';
import './index.scss';

const bindings = {
  report: '<',
  images: '<',
  theme: '<',
};

class StructuralVariants {
  $onInit() {
    this.firstGeneClicked = false;
    this.secondGeneClicked = false;
    this.columnDefs = columnDefs;
    this.StrucVars = {};
    this.titleMap = {
      clinical: 'Gene Fusions of Potential Clinical Relevance',
      nostic: 'Gene Fusions of Prognostic and Diagnostic Relevance',
      biological: 'Gene Fusions with Biological Relevance',
      uncharacterized: 'Structural Variants of Unknown Significance',
    };
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      const [
        structuralVariants,
        mavisSummary,
      ] = await Promise.all([
        StructuralVariantsService.all(this.report.ident),
        MavisService.all(this.report.ident),
      ]);

      this.structuralVariants = structuralVariants;
      this.mavisSummary = mavisSummary;

      this.processSvs(this.structuralVariants);
      this.loading = false;
      $rootScope.$digest();
    }
  }

  processSvs(structVars) {
    const svs = {
      clinical: [],
      nostic: [],
      biological: [],
      uncharacterized: [],
    };

    // Run over mutations and group
    for (const row of Object.values(structVars)) {
      let uncharacterized = true;
      // Therapeutic? => clinical
      if (row.kbMatches.some(m => m.category === 'therapeutic')) {
        svs.clinical.push(row);
        uncharacterized = false;
      }

      // Diagnostic || Prognostic? => nostic
      if (row.kbMatches.some(m => m.category === 'diagnostic' || m.category === 'prognostic')) {
        svs.nostic.push(row);
        uncharacterized = false;
      }

      // Biological ? => Biological
      if (row.kbMatches.some(m => m.category === 'biological')) {
        svs.biological.push(row);
        uncharacterized = false;
      }

      // Unknown
      if (uncharacterized) {
        svs.uncharacterized.push(row);
      }
    }

    // Set Small Mutations
    this.StrucVars = svs;
  }
}

export const StructuralVariantsComponent = {
  template,
  bindings,
  controller: StructuralVariants,
};

export default angular2react('structuralVariants', StructuralVariantsComponent, lazyInjector.$injector);
