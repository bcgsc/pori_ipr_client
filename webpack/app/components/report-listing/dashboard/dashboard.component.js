import template from './dashboard.pug';

const bindings = {
  reports: '<',
};

class DashboardComponent {
  $onInit() {
    this.reports = this.reports.sort();
    this.currentCases = this.reports;
    this.upstreamCases = [];
  }
}

export default {
  template,
  bindings,
  controller: DashboardComponent,
};
