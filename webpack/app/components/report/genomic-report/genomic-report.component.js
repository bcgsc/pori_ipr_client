import template from './genomic-report.pug';
import './genomic-report.scss';

const bindings = {
  pog: '<',
  report: '<',
};

class GenomicReportComponent {
  /* @ngInject */
  constructor($state, $window) {
    this.$state = $state;
    this.$window = $window;
  }

  $onInit() {
    this.sections = [
      {
        name: 'Analyst Comments',
        state: 'analystComments',
        meta: false,
        showChildren: false,
        clinician: true,
        children: [],
      },
      {
        name: 'Pathway Analysis',
        state: 'pathwayAnalysis',
        meta: false,
        showChildren: false,
        clinician: true,
        children: [],
      },
      {
        name: 'Potential Therapeutic Targets',
        state: 'therapeutic',
        meta: false,
        showChildren: false,
        clinician: true,
        children: [],
      },
      {
        name: 'Presentation',
        state: 'presentation',
        meta: false,
        showChildren: false,
        clinician: true,
        children: [
          { name: 'Additional Information', state: 'slide' },
          { name: 'Discussion Notes', state: 'discussion' },
        ],
      },
      {
        name: 'Detailed Genomic Analysis',
        state: null,
        meta: false,
        showChildren: false,
        clinician: true,
        category: true,
        children: [
          { name: 'Knowledgebase Matches', state: 'knowledgebase' },
          { name: 'DNA Repair', state: null, disabled: true },
          { name: 'Microbial', state: 'microbial' },
          { name: 'Spearman', state: 'spearman' },
          { name: 'HRD', state: 'hrd', disabled: true },
          { name: 'Disease Specific', state: 'diseaseSpecificAnalysis' },
        ],
      },
      {
        name: 'Somatic',
        state: null,
        meta: false,
        showChildren: false,
        clinician: true,
        category: true,
        children: [
          { name: 'Small Mutations', state: 'smallMutations' },
          { name: 'Copy Number Variants', state: 'copyNumberAnalyses' },
          { name: 'Structural Variants', state: 'structuralVariation' },
        ],
      },
      {
        name: 'Expression',
        state: 'expressionAnalysis',
        meta: false,
        showChildren: false,
        clinician: true,
        children: [],
      },
      {
        name: 'Appendices',
        state: 'appendices',
        meta: false,
        showChildren: false,
        clinician: true,
        children: [],
      },
      {
        name: 'History',
        state: 'history',
        meta: true,
        showChildren: false,
        clinician: false,
        children: [],
      },
      {
        name: 'Report Settings',
        state: 'meta',
        meta: true,
        showChildren: false,
        clinician: false,
        children: [],
      },
    ];
  }

  openPrint() {
    // State go!
    this.$window.open(this.$state.href('print.POG.report.genomic', {
      POG: this.pog.POGID, analysis_report: this.report.ident,
    }), '_blank');
  }
  
  /**
   * Check if the provided state is the current one
   * @param {String} state - state name
   * @return {Boolean} if state is active
   */
  activeSection(state) {
    if (this.$state.current.name.includes(state)) {
      return true;
    }
    return false;
  }

  goToReportSection(goto) {
    this.$state.go(`root.reportlisting.pog.genomic.${goto}`);
  }
}

export default {
  template,
  bindings,
  controller: GenomicReportComponent,
};
