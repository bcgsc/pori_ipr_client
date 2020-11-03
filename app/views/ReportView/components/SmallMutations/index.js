import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import SmallMutationsService from '@/services/reports/small-mutations.service';
import lazyInjector from '@/lazyInjector';
import template from './small-mutations.pug';
import { columnDefs } from './columnDefs';
import './index.scss';

const bindings = {
  report: '<',
  theme: '<',
};

class SmallMutations {
  $onInit() {
    this.titleMap = {
      biological: 'Variants of Biological Relevance',
      unknown: 'Variants of Unknown Significance',
      clinical: 'Variants of Therapeutic Relevance',
      nostic: 'Variants of Prognostic or Diagnostic Relevance',
    };
    this.columnDefs = columnDefs;
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.smallMutations = await SmallMutationsService.all(this.report.ident);

      this.processMutations(this.smallMutations);
      this.loading = false;
      $rootScope.$digest();
    }
  }

  processMutations(muts) {
    const mutations = {
      clinical: [],
      nostic: [],
      biological: [],
      unknown: [],
    };

    // Run over mutations and group
    for (const row of Object.values(muts)) {
      let unknown = true;
      // Therapeutic? => clinical
      if (row.kbMatches.some(m => m.category === 'therapeutic')) {
        mutations.clinical.push(row);
        unknown = false;
      }

      // Diagnostic || Prognostic? => nostic
      if (row.kbMatches.some(m => (m.category === 'diagnostic' || m.category === 'prognostic'))) {
        mutations.nostic.push(row);
        unknown = false;
      }

      // Biological ? => Biological
      if (row.kbMatches.some(m => m.category === 'biological')) {
        mutations.biological.push(row);
        unknown = false;
      }
      // Unknown
      if (unknown) {
        mutations.unknown.push(row);
      }
    }

    // Set Small Mutations
    this.smallMutations = mutations;
  }
}

export const SmallMutationsComponent = {
  template,
  bindings,
  controller: SmallMutations,
};

export default angular2react('smallMutations', SmallMutationsComponent, lazyInjector.$injector);
