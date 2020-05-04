import template from './expression-analysis.pug';
import './expression-analysis.scss';
import { EXPLEVEL } from '../constants';

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

  // Sort outliers into categories
  processExpression(input) {
    const expressions = {
      clinical: [],
      nostic: [],
      biological: [],
      upreg_onco: [], //  Check for expression_class (str) and gene.oncogene (bool)
      downreg_tsg: [], //  Check for expression_class (str) and gene.tumourSuppressor (bool)
    };

    // Run over mutations and group
    for (const row of input) {
      const { gene: { tumourSuppressor, oncogene }, expression_class: expressionClass } = row;
      if (tumourSuppressor && expressionClass === EXPLEVEL.OUT_LOW) {
        expressions.downreg_tsg.push(row);
      }
      if (oncogene && EXPLEVEL.UP.includes(expressionClass)) {
        expressions.upreg_onco.push(row);
      }

      // KB matches
      // Therapeutic? => clinical
      if (row.kbMatches.some(m => m.category === 'therapeutic')) {
        expressions.clinical.push(row);
      }

      // Diagnostic || Prognostic? => nostic
      if (row.kbMatches.some(m => m.category === 'diagnostic' || m.category === 'prognostic')) {
        expressions.nostic.push(row);
      }

      // Biological ? => Biological
      if (row.kbMatches.some(m => m.category === 'biological')) {
        expressions.biological.push(row);
      }
    }

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
