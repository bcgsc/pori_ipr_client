import template from './genomic-report.pug';
import './genomic-report.scss';

const bindings = {
  pog: '<',
  report: '<',
};

class GenomicReportComponent {
  /* @ngInject */
  constructor($state, $window, AclService) {
    this.$state = $state;
    this.$window = $window;
    this.AclService = AclService;
  }

  $onInit() {
    this.sectionIndex = 0;
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
        state: 'dga',
        meta: false,
        showChildren: false,
        clinician: true,
        category: true,
        children: [
          { name: 'Knowledgebase Matches', state: 'knowledgebase' },
          { name: 'Microbial', state: 'microbial' },
          { name: 'Spearman', state: 'spearman' },
          { name: 'Disease Specific', state: 'diseaseSpecificAnalysis' },
        ],
      },
      {
        name: 'Somatic',
        state: 'somatic',
        meta: false,
        showChildren: false,
        clinician: true,
        category: true,
        children: [
          { name: 'Small Mutations', state: 'smallMutations' },
          { name: 'Copy Number Analyses', state: 'copyNumberAnalyses' },
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

  isChildOf(parent, child) {
    const parentIndex = this.sections.findIndex((section) => {
      return section.state === parent;
    });

    if (parentIndex !== -1 && this.sections[parentIndex].children.length > 0) {
      return this.sections[parentIndex].children.some((childSection) => {
        return childSection.state === child;
      });
    }
    return false;
  }
  
  /**
   * Check if the provided state is the current one
   * Also expand parent section if needed
   * @param {String} state - state name
   * @return {Boolean} if state is active
   */
  activeSection(state) {
    if (this.$state.current.name.includes(state)) {
      // Show subsection if child state is active
      this.sectionIndex = this.sections.findIndex((section, index) => {
        if (section.children.length > 0) {
          return (section.children.some((child) => {
            return child.state === state;
          }) ? index : -1) !== -1;
        }
        return false;
      });
      if (this.sectionIndex !== -1) {
        this.sections[this.sectionIndex].showChildren = true;
      } else {
        this.sectionIndex = 0;
      }
      // Return bool for if section is active
      return true;
    }
    return false;
  }

  goToReportSection(goto) {
    // Close section header if navigating away from section
    if (Object.prototype.hasOwnProperty.call(this.sections[this.sectionIndex], 'showChildren')
      && !this.isChildOf(this.sections[this.sectionIndex].state, goto)
    ) {
      this.sections[this.sectionIndex].showChildren = false;
    }
    this.$state.go(`root.reportlisting.pog.genomic.${goto}`);
  }
}

export default {
  template,
  bindings,
  controller: GenomicReportComponent,
};
