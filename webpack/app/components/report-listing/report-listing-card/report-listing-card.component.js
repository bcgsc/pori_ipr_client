import template from './report-listing-card.pug';
import './report-listing-card.scss';

export default {
  template: template,
  bindings: {
    report: '<',
    pog: '<',
    state: '@',
  },
  controller: class ReportListingCardComponent {
    /* @ngInject */
    constructor($mdDialog, $mdToast, $state) {
      this.$mdDialog = $mdDialog;
      this.$mdToast = $mdToast;
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
      const user = _.find(this.report.users, { role: role });
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
  },
};
