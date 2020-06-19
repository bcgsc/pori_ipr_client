import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import MutationSummaryService from '@/services/reports/mutation-summary.service';
import MavisService from '@/services/reports/mavis.service';
import StructuralVariantsService from '@/services/reports/structural-variants.service';
import ImageService from '@/services/reports/image.service';
import lazyInjector from '@/lazyInjector';

import template from './structural-variants.pug';
import columnDefs, { setHeaderName } from './columnDefs';
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
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      const promises = Promise.all([
        ImageService.get(
          this.report.ident,
          'mutation_summary.barplot_sv,mutation_summary.density_plot_sv,circosSv.genome,circosSv.transcriptome',
        ),
        MutationSummaryService.get(this.report.ident),
        StructuralVariantsService.all(this.report.ident),
        ImageService.mutationSummary(this.report.ident),
        MavisService.all(this.report.ident),
      ]);
      const [
        images,
        mutationSummary,
        structuralVariants,
        mutationSummaryImages,
        mavisSummary,
      ] = await promises;

      this.images = images;
      this.mutationSummary = mutationSummary;
      this.structuralVariants = structuralVariants;
      this.mutationSummaryImages = mutationSummaryImages;
      this.mavisSummary = mavisSummary;

      setHeaderName(`${this.report.tumourAnalysis.diseaseExpressionComparator || ''} %ile`, 'tcgaPerc');
      setHeaderName(`Fold Change vs ${this.report.tumourAnalysis.normalExpressionComparator}`, 'foldChange');
      this.processSvs(this.structuralVariants);
      this.pickComparator();
      this.processMutationSummaryImages(this.mutationSummaryImages);
      $rootScope.$digest();
    }
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
      sv: {
        barplot: [],
        densityPlot: [],
      },
      legend: {
        sv: null,
      },
    };

    Object.values(images).forEach((img) => {
      if (!img.key.includes('sv')) {
        return;
      }

      const pieces = img.key.split('.');
      img.comparator = pieces[2] || null;
      if (!img.comparator) {
        // If no comparator found in image, likely legacy and use report setting.
        img.comparator = this.report.tumourAnalysis.diseaseExpressionComparator || '';
      }

      if (img.comparator.toLowerCase()
        && !sorted.comparators.some(comp => comp.name === img.comparator.toLowerCase())) {
        sorted.comparators.push({ name: img.comparator.toLowerCase(), visible: false });
      }

      if (pieces[1].includes('barplot_sv') || pieces[1] === 'bar_sv') {
        sorted.sv.barplot.push(img);
      }
      if (pieces[1].includes('density') || pieces[1] === 'sv') {
        sorted.sv.densityPlot.push(img);
      }
      if (pieces[1].includes('legend_sv')) {
        sorted.legend.sv = img;
      }
    });
    this.mutationSummaryImages = sorted;
  }

  /**
   * Retrieve specific mutation summary image
   *
   * @param {string} graph - The type of graph image to be retrieved (barplot, density graph, legend)
   * @param {string} type - The type of analysis (snv, indel, sv)
   * @param {string} comparator - OPTIONAL The comparator to be picked
   *
   * @returns
   */
  getMutationSummaryImage(graph, type, comparator = null) {
    if (comparator === null) {
      const img = this.mutationSummaryImages[type][graph];
      if (img && img.length === 1) {
        return img[0];
      }
    }
    return this.mutationSummaryImages[type][graph].find(entry => (entry.comparator.toLowerCase() === comparator.toLowerCase()));
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
