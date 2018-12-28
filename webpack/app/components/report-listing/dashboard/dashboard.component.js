import template from './dashboard.pug';

export default {
  template: template,
  bindings: {
    reports: '<',
  },
  controller: class DashboardComponent {
    $onInit() {
      this.reports = this.reports.sort();
      this.currentCases = this.reports;
      this.upstreamCases = [];
    }
  },
};
