import template from './report-table.pug';
import './report-table.scss';

const bindings = {
  reports: '<',
  clinician: '<',
  pagination: '<',
  type: '<',
};

class ReportTable {
  /* @ngInject */
  constructor(ReportService, $mdToast, $scope) {
    this.ReportService = ReportService;
    this.$mdToast = $mdToast;
    this.$scope = $scope;
    this.filter = {
      bound: false,
      states: 'ready,active,presented',
      search: null,
    };
  }

  async $onInit() {
    this.paginate = {
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      total: this.pagination.total,
    };
    this.loading = false;
    await this.refreshReports();
  }
  
  async clearSearch() {
    this.showSearch = false;
    this.focusSearch = false;
    
    this.paginate.offset = 0;

    const filterCache = this.filter.search;

    this.filter.search = null;
    if (filterCache !== undefined) {
      await this.refreshReports();
    }
    this.$scope.$digest();
  }

  displaySearch() {
    this.showSearch = true;
    this.focusSearch = true;
  }
  
  
  async prevPage() {
    this.paginate.offset -= this.paginate.limit;
    await this.refreshReports();
    this.$scope.$digest();
  }
  
  async nextPage() {
    this.paginate.offset += this.paginate.limit;
    await this.refreshReports();
    this.$scope.$digest();
  }
  
  
  async search() {
    this.paginate.offset = 0;
    await this.refreshReports();
    this.$scope.$digest();
  }

  /* eslint-disable-next-line class-methods-use-this */
  readState(s) {
    let state;
    switch (s) {
      case 'ready':
        state = 'Ready for Analysis';
        break;
      case 'active':
        state = 'Analysis Underway';
        break;
      case 'presented':
        state = 'Presentation';
        break;
      case 'archived':
        state = 'Archived';
        break;
      case 'reviewed':
        state = 'Reviewed';
        break;
      default:
        state = 'N/A';
        break;
    }
    return state;
  }
  
  /**
   * Call API and refresh reports
   *
   * Makes call to IPR API with filters and pagination
   *
   * @returns {undefined}
   */
  async refreshReports() {
    const opts = {};
    
    this.loading = true;
    opts.type = this.type;
    opts.states = this.filter.states;
    opts.project = this.filter.project;
    opts.paginated = true;
    opts.offset = this.paginate.offset;
    opts.limit = this.paginate.limit;
    
    if (!this.filter.bound) opts.all = true;
    if (this.filter.search) opts.searchText = this.filter.search;
    
    if (this.clinician) {
      if (this.type === 'genomic') opts.states = 'presented,archived';
      if (this.type === 'probe') opts.states = 'reviewed';
    }
    try {
      const reportResults = await this.ReportService.allFiltered(opts);

      this.paginate.total = reportResults.total;
      this.reports = reportResults.reports;
          
      this.loading = false;
    } catch (err) {
      this.$mdToast.showSimple(`An error occurred when loading reports: ${err.message}`);
      this.loading = false;
    }
    this.$scope.$digest();
  }
}

export default {
  template,
  bindings,
  controller: ReportTable,
};
