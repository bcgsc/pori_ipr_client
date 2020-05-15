import template from './germline-board.pug';
import getDate from '../../../services/utils/date';

const bindings = {
  reports: '<',
};

class GermlineBoardComponent {
  /* @ngInject */
  constructor(GermlineService, $window, $timeout, $scope, $mdToast) {
    this.GermlineService = GermlineService;
    this.$window = $window;
    this.$timeout = $timeout;
    this.$scope = $scope;
    this.$mdToast = $mdToast;
  }

  $onInit() {
    this.loading = false;
    this.showSearch = true;
    this.focusSearch = false;
    this.filter = {
      search: null,
    };
    this.paginate = {
      total: this.reports.total,
      offset: 0,
      limit: 25,
    };
    this.reports = this.reports.reports;
  }


  clearSearch() {
    this.focusSearch = false;

    const filterCache = this.filter.search;

    this.filter.search = null;
    if (filterCache !== undefined) {
      this.refreshReports();
    }
  }

  displaySearch() {
    this.showSearch = true;
    this.focusSearch = true;
  }

  /* eslint-disable class-methods-use-this */
  hasReview(report, type) {
    return report.reviews.find(review => review.type === type);
  }

  async unsetExported(report) {
    try {
      if (report.exported === false) {
        return;
      }

      report.exported = false;
      const reportCache = angular.copy(report);
      reportCache.biofx_assigned = report.biofx_assigned.ident;

      const result = await this.GermlineService.updateReport(reportCache.ident, reportCache);
      const i = this.reports.findIndex(rep => rep.ident === reportCache.ident);

      this.reports[i] = result;
    } catch (err) {
      report.exported = true;
      this.$mdToast.showSimple('Failed to update report exported status.');
    }
  }


  /**
   * Update search criteria and trigger reload
   */
  search() {
    this.refreshReports();
  }

  /**
   * Reload tracking data from API
   *
   */
  async refreshReports() {
    this.loading = true;
    // start from first page of paginator if performing search
    if (this.filter.search) {
      this.paginate.offset = 0;
    }

    const opts = {
      offset: this.paginate.offset,
      limit: this.paginate.limit,
      patientId: this.filter.search,
    };

    const reports = await this.GermlineService.getAllReports(opts);
    this.paginate.total = reports.total;
    this.reports = reports.reports;
    this.loading = false;
    this.$scope.$digest();
  }

  /**
   * The download attribute doesn't work properly when href is cross-site.
   * This function gets the data first, then simulates a click and serves the content via blob
   */
  async getExport() {
    try {
      const date = getDate();

      const exportData = await this.GermlineService.export();
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `germline_export_${date}`;

      const clickHandler = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          this.removeEventListener('click', clickHandler);
          this.refreshReports();
        }, 150);
      };

      a.addEventListener('click', clickHandler, false);

      a.click();
    } catch (err) {
      this.$mdToast.showSimple('Failed to retrieve the downloadable export');
    }
  }
}

export default {
  template,
  bindings,
  controller: GermlineBoardComponent,
};
