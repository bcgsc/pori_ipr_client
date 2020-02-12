import template from './germline.pug';

const bindings = {
  reports: '<',
};

class GermlineComponent {
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
      
      const result = await this.GermlineService.updateReport(reportCache.analysis.pog.POGID,
        reportCache.analysis.analysis_biopsy, reportCache.ident, reportCache);
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
      search: this.filter.search,
    };
    
    const reports = await this.GermlineService.getAllReports(opts);
    this.paginate.total = reports.total;
    this.reports = reports.reports;
    this.loading = false;
    this.$scope.$digest();
  }
  
  // Trigger download pipe
  async getExport() {
    try {
      const token = await this.GermlineService.getFlashToken();
      // Open a window for the user with the special url
      this.$window.open(`${CONFIG.ENDPOINTS.API}/export/germline_small_mutation/batch/download?reviews=biofx,projects&flash_token=${token.token}`, '_blank');
      
      this.$timeout(() => {
        this.refreshReports();
      }, 500);
    } catch (err) {
      this.$mdToast.showSimple('Failed to retrieve the downloadable export');
    }
  }
}

export default {
  template,
  bindings,
  controller: GermlineComponent,
};
