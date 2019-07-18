import template from './probe-report.pug';
import './probe-report.scss';

const bindings = {
  pog: '<',
  report: '<',
};

class ProbeComponent {
  /* @ngInject */
  constructor($state, $window, PogService, AclService) {
    this.$state = $state;
    this.$window = $window;
    this.PogService = PogService;
    this.AclService = AclService;
  }

  openPrint() {
    this.$window.open(this.$state.href('print.POG.report.probe', {
      POG: this.pog.POGID,
      analysis_report: this.report.ident,
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
