import template from './small-mutations.pug';
import './small-mutations.scss';

const bindings = {
  pog: '<',
  report: '<',
  images: '<',
  mutationSummaryImages: '<',
  mutationSummary: '<',
  smallMutations: '<',
  mutationSignature: '<',
};

class SmallMutationsComponent {
  /* @ngInject */
  constructor($scope, $state, $mdDialog, $mdToast, PogService, SmallMutationsService) {
    this.$scope = $scope;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.PogService = PogService;
    this.SmallMutationsService = SmallMutationsService;
  }

  $onInit() {
    this.processMutationSummaryImages(this.mutationSummaryImages);
    this.processMutations(this.smallMutations);
    this.pickCompatator();
  }

  processMutations(muts) {
    const mutations = {
      clinical: [],
      nostic: [],
      biological: [],
      unknown: [],
    };

    // Run over mutations and group
    Object.values(muts).forEach((row) => {
      if (!(row.mutationType in mutations)) {
        mutations[row.mutationType] = [];
      }
      // Add to type
      mutations[row.mutationType].push(row);
    });

    // Set Small Mutations
    this.smallMutations = mutations;
  }
  
  pickCompatator() {
    let search = _.find(this.mutationSummary, {
      comparator: this.report.tumourAnalysis.diseaseExpressionComparator,
    });
    
    if (!search) {
      search = _.find(this.mutationSummary, { comparator: 'average' });
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
    
    _.forEach(images, (img) => {
      // If it's an SV image, skip!
      if (img.filename.includes('_sv.')) {
        return;
      }
      // Explode filename to extract comparator
      const pieces = img.key.split('.');
      
      // If no comparator in key, set to null
      img.comparator = pieces[2] || null;
      
      // If there's no comparator, and the file isn't an sv image, set the comparator to the value selected from tumour analysis (Backwards compatibility for v4.5.1 and older)
      if (!img.comparator) {
        // If no comparator found in image, likely legacy and use report setting.
        img.comparator = this.report.tumourAnalysis.diseaseExpressionComparator;
      }

      if (img.filename.includes('legend') && img.filename.includes('snv_indel')) {
        sorted.legend.snv_indel = img;
        return;
      }
      
      // Set comparator to lowercase
      if (img.comparator.toLowerCase() && !_.find(sorted.comparators, {
        name: img.comparator.toLowerCase(),
      })) {
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
   *
   * @param {string} graph - The type of graph image to be retrieved (barplot, density graph, legend)
   * @param {string} type - The type of analysis (snv, indel, sv)
   * @param {string} comparator - OPTIONAL The comparator to be picked
   *
   * @returns
   */
  getMutationSummaryImage(graph, type, comparator = null) {
    return _.find(this.mutationSummaryImages[type][graph], (c) => {
      return (c.comparator.toLowerCase() === comparator.toLowerCase());
    });
  }
}

export default {
  template,
  bindings,
  controller: SmallMutationsComponent,
};
