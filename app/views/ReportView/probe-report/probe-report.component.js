import template from '../genomic-report/genomic-report.pug';
import '../genomic-report/genomic-report.scss';

const bindings = {
  report: '<',
  reportEdit: '<',
};

class ProbeComponent {
  /* @ngInject */
  constructor($state, $window, $scope) {
    this.$state = $state;
    this.$window = $window;
    this.$scope = $scope;
    this.isVisible = true;
    // this must be an arrow function to pass the context correctly to react
    this.toggleIsVisible = () => {
      this.isVisible = !this.isVisible;
      this.$scope.$digest();
    };
  }

  $onInit() {
    this.sections = [
      {
        name: 'Detailed Genomic Analysis',
        state: 'detailedGenomicAnalysis',
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
        name: 'Report Settings',
        state: 'reportSettings',
        meta: true,
        showChildren: false,
        clinician: false,
        children: [],
      },
    ];
  }

  openPrint() {
    this.$window.open(this.$state.href('print.probe', {
      report: this.report.ident,
    }), '_blank');
  }

  /**
   * Check if the provided state is the current one
   * @param {String} section - section name
   * @return {Boolean} bool if section is active
   */
  activeSection(section) {
    if (this.$state.current.name.includes(section)) {
      return true;
    }
    return false;
  }


  goToReportSection(goto) {
    this.$state.go(`^.${goto}`);
  }
}

export default {
  template,
  bindings,
  controller: ProbeComponent,
};
