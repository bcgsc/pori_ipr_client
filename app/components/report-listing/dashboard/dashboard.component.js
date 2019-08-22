import template from './dashboard.pug';
import './dashboard.scss';

const bindings = {
  reports: '<',
};

class DashboardComponent {
  $onInit() {
    this.reports = this.reports.reports.sort();
    this.currentCases = this.reports;
    this.upstreamCases = [];
  }
}

export default {
  template,
  bindings,
  controller: DashboardComponent,
};
