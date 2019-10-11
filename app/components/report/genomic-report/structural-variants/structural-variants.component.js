import template from './structural-variants.pug';
import './structural-variants.scss';

const bindings = {
  pog: '<',
  report: '<',
  images: '<',
  structuralVariants: '<',
  mutationSummary: '<',
  mutationSummaryImages: '<',
  mavisSummary: '<',
};

class StructuralVariantsComponent {
  /* @ngInject */
  constructor(PogService) {
    this.PogService = PogService;
    this.firstGeneClicked = false;
    this.secondGeneClicked = false;
  }

  $onInit() {
    this.StrucVars = {};
    this.titleMap = {
      clinical: 'Gene Fusions of Potential Clinical Relevance',
      nostic: 'Gene Fusions of Prognostic and Diagnostic Relevance',
      biological: 'Gene Fusions with Biological Relevance',
      fusionOmicSupport: 'Gene Fusions with Genome and Transcriptome Support',
    };
    this.processSvs(this.structuralVariants);
    this.pickComparator();
    this.processMutationSummaryImages(this.mutationSummaryImages);
  }

  
  pickComparator() {
    let search = this.mutationSummary.find((entry) => {
      return entry.comparator === this.report.tumourAnalysis.diseaseExpressionComparator;
    });
    
    if (!search) {
      search = this.mutationSummary.find((entry) => {
        return entry.comparator === 'average';
      });
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
        img.comparator = this.report.tumourAnalysis.diseaseExpressionComparator;
      }
  
      if (img.comparator.toLowerCase()
        && !sorted.comparators.some(comp => comp.name === img.comparator.toLowerCase())) {
        sorted.comparators.push({ name: img.comparator.toLowerCase(), visible: false });
      }
  
      if (pieces[1].includes('barplot_sv') || pieces[1] === 'bar_sv') {
        sorted.sv.barplot.push(img);
      }
      if (pieces[1].includes('density_plot_sv') || pieces[1] === 'sv') {
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
    return this.mutationSummaryImages[type][graph].find((entry) => {
      return (entry.comparator.toLowerCase() === comparator.toLowerCase());
    });
  }
  
  
  processSvs(structVars) {
    const svs = {
      clinical: [],
      nostic: [],
      biological: [],
      fusionOmicSupport: [],
    };
    // Run over mutations and group
    Object.values(structVars).forEach((row) => {
      // append mavis summary to row if it has a mavis_product_id
      const sv = row;
      if (row.mavis_product_id) {
        try {
          sv.summary = this.mavisSummary.find((entry) => {
            return entry.product_id === sv.mavis_product_id;
          }).summary;
        } catch (err) {
          console.info('No matching Mavis summary was found.');
        }
      }

      // Setting fields to omit from details viewer
      delete sv.mavis_product_id;

      if (!(sv.svVariant in svs)) {
        svs[sv.svVariant] = [];
      }
      // Add to type
      svs[sv.svVariant].push(sv);
    });

    // Set Small Mutations
    this.StrucVars = svs;
  }
}

export default {
  template,
  bindings,
  controller: StructuralVariantsComponent,
};
