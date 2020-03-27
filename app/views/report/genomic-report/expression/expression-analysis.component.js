import template from './expression-analysis.pug';
import './expression-analysis.scss';
import { EXPLEVEL } from '../consts';

const bindings = {
  report: '<',
  mutationSummary: '<',
  outliers: '<',
  densityGraphs: '<',
};

class ExpressionAnalysisComponent {
  $onInit() {
    this.showSection = {
      analysis: true,
      outlierSummary: true,
      mrnaOutliers: true,
      drugTargetable: false,
    };
    this.expOutliers = {};
    /* can remove next line when API returns array */
    this.densityGraphs = Object.values(this.densityGraphs);

    this.expSummaryMap = {
      clinical: 'Expression Level Outliers of Potential Clinical Relevance',
      nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
      biological: 'Expression Level Outliers of Biological Relevance',
    };

    this.mRNAOutliersMap = {
      upreg_onco: 'Up-Regulated Oncogenes',
      downreg_tsg: 'Down-Regulated Tumour Suppressor Genes',
    };

    this.ptxComparator = this.getPtxComparator();
    this.processExpression(this.outliers, 'outlier');
    this.getPtxComparator();
  }

  /* eslint-disable class-methods-use-this */
  // Convert full hex to 6chr
  colourHex(hex) {
    return hex.match(/([A-z0-9]{6}$)/)[0];
  }

  getPtxComparator() {
    if (!this.outliers.length) {
      return { comparator: 'N/A', sumSamples: 0 };
    }

    let comparator;
    if (this.outliers[0].ptxPercCol) {
      /* Get part of substring. Ex: PTX_POG_OV_percentile returns OV */
      comparator = this.outliers[0].ptxPercCol.substring(
        this.outliers[0].ptxPercCol.lastIndexOf('PTX_POG_') + 8,
        this.outliers[0].ptxPercCol.lastIndexOf('_percentile'),
      );
    } else {
      comparator = 'N/A';
    }
    return comparator;
  }

  searchDrugs(query) {
    return (drug) => {
      if (!query) {
        return true;
      }
      // Rever to false return
      let result = false;
      const names = [drug.gene, drug.lohRegion, drug.drugOptions].join().toLowerCase();

      if (names.includes(query.toLowerCase())) {
        result = true;
      }
      return result;
    };
  }

  /**
   * Returns 1 if up-regulated, -1 if down-regulated, 0 for no difference between reference 
   * @param {string|null} exp expression level as a string
   */
  getRegLevel(exp) {
    if (!exp) { return 0 };
    if (exp === EXPLEVEL.OUT_HIGH || exp === EXPLEVEL.OVEREXPRESSED) { return 1 }
    return -1;
  }

  // Sort outliers into categories
  processExpression(input) {
    const expressions = {
      clinical: [],
      nostic: [],
      biological: [],
      upreg_onco: [],     //  Check for expression_class (str) and gene.oncogene (bool)
      downreg_tsg: [],    //  Check for expression_class (str) and gene.tumourSuppressor (bool)
    };

    // Run over mutations and group
    input.forEach((row) => {
      let { tumourSuppressor, oncogene } = row.gene;
      if (tumourSuppressor && this.getRegLevel(row.expression_class) === -1) {
        expressions.downreg_tsg.push(row);
      }
      if (oncogene && this.getRegLevel(row.expression_class) === 1) {
        expressions.upreg_onco.push(row);
      }
      // TODO: clinical, nostic, and biological to come 
    });
    this.expOutliers = expressions;
  }

  processGraphs() {
    const graphs = {};

    this.densityGraphs.forEach((graph) => {
      const gene = graph.filename.split('.')[0];
      graphs[gene] = graph;
    });

    this.densityGraphs = graphs;
  }
}

export default {
  template,
  bindings,
  controller: ExpressionAnalysisComponent,
};
