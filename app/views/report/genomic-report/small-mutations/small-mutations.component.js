import template from './small-mutations.pug';
import columnDefs, { setHeaderName } from './columnDefs';
import './small-mutations.scss';

const bindings = {
  report: '<',
  images: '<',
  mutationSummaryImages: '<',
  mutationSummary: '<',
  smallMutations: '<',
  mutationSignature: '<',
};

class SmallMutationsComponent {
  /* @ngInject */
  constructor($scope, $state, $mdDialog, SmallMutationsService) {
    this.$scope = $scope;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.SmallMutationsService = SmallMutationsService;
  }

  $onInit() {
    this.columnDefs = columnDefs;
    setHeaderName(`${this.report.tumourAnalysis.diseaseExpressionComparator} %ile`, 'tcgaPerc');
    setHeaderName(`Fold Change vs ${this.report.tumourAnalysis.normalExpressionComparator}`, 'foldChange');
    this.processMutationSummaryImages(this.mutationSummaryImages);
    this.processMutations(this.smallMutations);
    this.pickComparator();
  }

  processMutations(muts) {
    const mutations = {
      clinical: [],
      nostic: [],
      biological: [],
      unknown: [],
    };

    // Run over mutations and group
    const mutationRows = Object.values(muts);
    let row;
    for (let i = 0; i < mutationRows.length; i++) {
      row = mutationRows[i];

      // Therapeutic? => clinical
      if (row.kbMatches.some(m => m.category === 'therapeutic')) {
        mutations.clinical.push(row);
        continue;
      }

      // Diagnostic || Prognostic? => nostic
      if (row.kbMatches.some(m => m.category === 'diagnostic' || m.category === 'prognostic')) {
        mutations.nostic.push(row);
        continue;
      }

      // Biological ? => Biological
      if (row.kbMatches.some(m => m.category === 'biological')) {
        mutations.biological.push(row);
        continue;
      }
      // Unknown
      mutations.unknown.push(row);
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
        img.comparator = this.report.tumourAnalysis.diseaseExpressionComparator;
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

  /* eslint-disable class-methods-use-this */
  getTableTitle(table) {
    switch (table) {
      case 'biological':
        return 'Variants of Biological Relevance';
      case 'unknown':
        return 'Variants of Unknown Significance in Known Cancer-Related Genes';
      case 'clinical':
        return 'Variants of Clinical Relevance';
      case 'nostic':
        return 'Variants of Prognostic or Diagnostic Relevance';
      default:
        return 'Other Variants';
    }
  }
}

export default {
  template,
  bindings,
  controller: SmallMutationsComponent,
};
