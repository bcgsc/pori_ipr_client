import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import SmallMutationsService from '@/services/reports/small-mutations.service';
import MutationSummaryService from '@/services/reports/mutation-summary.service';
import ImageService from '@/services/reports/image.service';
import lazyInjector from '@/lazyInjector';
import template from './small-mutations.pug';
import { setHeaderName, columnDefs } from './columnDefs';
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
      clinical: 'Variants of Clinical Relevance',
      nostic: 'Variants of Prognostic or Diagnostic Relevance',
    };
    this.columnDefs = columnDefs;
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      const promises = Promise.all([
        ImageService.get(
          this.report.ident,
          'mutSignature.corPcors,mutSignature.snvsAllStrelka',
        ),
        MutationSummaryService.get(this.report.ident),
        SmallMutationsService.all(this.report.ident),
      ]);

      const [
        images, mutationSummary, smallMutations,
      ] = await promises;
      this.images = images;
      this.mutationSummary = mutationSummary;
      this.smallMutations = smallMutations;

      setHeaderName(`${this.report.tumourAnalysis.diseaseExpressionComparator || ''} %ile`, 'tcgaPerc');
      setHeaderName(`Fold Change vs ${this.report.tumourAnalysis.normalExpressionComparator}`, 'foldChange');
      this.processMutations(this.smallMutations);
      this.pickComparator();
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

  pickComparator() {
    let search = this.mutationSummary.find(entry => entry.comparator === this.report.tumourAnalysis.diseaseExpressionComparator);

    if (!search) {
      search = this.mutationSummary.find(entry => entry.comparator === 'average');
    }

    this.mutationSummary = search;
  }

  /**
   * Retrieve specific mutation summary image
   * @param {string} graph - The type of graph image to be retrieved (barplot, density graph, legend)
   * @param {string} type - The type of analysis (snv, indel, sv)
   * @param {string} comparator - OPTIONAL The comparator to be picked
   * @return {String} Image data
   */
  getMutationSummaryImage(graph, type, comparator = null) {
    return this.mutationSummaryImages[type][graph].find(c => (c.comparator.toLowerCase() === comparator.toLowerCase()));
  }
}

export const SmallMutationsComponent = {
  template,
  bindings,
  controller: SmallMutations,
};

export default angular2react('smallMutations', SmallMutationsComponent, lazyInjector.$injector);
