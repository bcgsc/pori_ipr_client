import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import SmallMutationsService from '@/services/reports/small-mutations.service';
import MutationSummaryService from '@/services/reports/mutation-summary.service';
import MutationSignatureService from '@/services/reports/mutation-signature.service';
import ImageService from '@/services/reports/image.service';
import lazyInjector from '@/lazyInjector';
import template from './small-mutations.pug';
import { setHeaderName, columnDefs, signatureColumnDefs } from './columnDefs';
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
        ImageService.mutationSummary(this.report.ident),
        MutationSummaryService.get(this.report.ident),
        SmallMutationsService.all(this.report.ident),
        MutationSignatureService.all(this.report.ident),
      ]);

      const [
        images, mutationSummaryImages, mutationSummary, smallMutations, mutationSignature,
      ] = await promises;
      this.images = images;
      this.mutationSummaryImages = mutationSummaryImages;
      this.mutationSummary = mutationSummary;
      this.smallMutations = smallMutations;
      this.mutationSignature = mutationSignature;

      setHeaderName(`${this.report.tumourAnalysis.diseaseExpressionComparator || ''} %ile`, 'tcgaPerc');
      setHeaderName(`Fold Change vs ${this.report.tumourAnalysis.normalExpressionComparator}`, 'foldChange');
      this.processMutationSummaryImages(this.mutationSummaryImages);
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

  processMutationSummaryImages(images) {
    const sorted = {
      comparators: [],
      indel: {
        barplot: [],
        densityPlot: [],
      },
      snv: {
        barplot: [],
        densityPlot: [],
      },
      sv: {
        barplot: [],
        densityPlot: [],
      },
      legend: {
        snv_indel: [],
        sv: null,
      },
    };
    Object.values(images).forEach((img) => {
      // If it's an SV image, skip!
      if (img.filename.includes('_sv.')) {
        return;
      }
      // Explode filename to extract comparator
      const pieces = img.key.split('.');

      // If no comparator in key, set to null
      img.comparator = pieces[2] || null;

      /* If there's no comparator and the file isn't an sv image: */
      /* set the comparator to the value selected from tumour analysis */
      /* (Backwards compatibility for v4.5.1 and older) */
      if (!img.comparator) {
        // If no comparator found in image, likely legacy and use report setting.
        img.comparator = this.report.tumourAnalysis.diseaseExpressionComparator || '';
      }

      if (img.filename.includes('legend') && img.filename.includes('snv_indel')) {
        sorted.legend.snv_indel = img;
        return;
      }

      // Set comparator to lowercase
      if (img.comparator.toLowerCase() && !sorted.comparators.find(entry => entry.name === img.comparator.toLowerCase())) {
        sorted.comparators.push({ name: img.comparator.toLowerCase(), visible: false });
      }

      if (pieces[1].includes('barplot_indel') || pieces[1] === 'bar_indel') {
        sorted.indel.barplot.push(img);
      }
      if (pieces[1].includes('barplot_snv') || pieces[1] === 'bar_snv') {
        sorted.snv.barplot.push(img);
      }

      if (pieces[1].includes('density_plot_indel') || pieces[1] === 'indel') {
        sorted.indel.densityPlot.push(img);
      }
      if (pieces[1].includes('density_plot_snv') || pieces[1] === 'snv') {
        sorted.snv.densityPlot.push(img);
      }
    });
    this.mutationSummaryImages = sorted;
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
