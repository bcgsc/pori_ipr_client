import template from './report-listing-card.pug';
import './report-listing-card.scss';

const bindings = {
  report: '<',
  pog: '<',
  state: '@',
};

class ReportListingCardComponent {
  /* @ngInject */
  constructor($mdDialog, $state) {
    this.$mdDialog = $mdDialog;
    this.$state = $state;
  }

  /**
   * Get Tumour Content
   * @return {String|Number} Tumour content (unsure what type this returns)
   */
  getTumourContent() {
    if (this.report.type !== 'genomic') {
      return 'N/A';
    }
    return this.report.tumourAnalysis.tumourContent;
  }

  /**
   * Get Ploidy Model Content
   * @return {String|Number} Pliody content
   */
  getPloidy() {
    if (this.report.type !== 'genomic') {
      return 'N/A';
    }
    return this.report.tumourAnalysis.ploidy;
  }

  /**
   * Get role
   * @param {String} role - user role
   * @param {Enumerator} resp - type of response (name or username)
   * @return {String} Name or username
   */
  getRoleUser(role, resp) {
    const user = this.report.users.find((entry) => {
      return entry.role === role;
    });
    if (!user) {
      return null;
    }
    switch (resp) {
      case 'name':
        return `${user.user.firstName} ${user.user.lastName}`;
      case 'username':
        return user.user.username;
      default:
        return null;
    }
  }
}

export default {
  template,
  bindings,
  controller: ReportListingCardComponent,
};
