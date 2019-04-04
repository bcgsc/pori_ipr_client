app.directive('iprReportTable', ['api.pog_analysis_report', '$mdToast', '$async', ($report, $mdToast, $async) => {
  return {
    restrict: 'E',
    transclude: false,
    scope: {
      reports: '=reports',
      clinician: '=clinician',
      pagination: '=?pagination',
      type: '=type',
    },
    templateUrl: 'ipr-report-table/ipr-report-table.html',
    link: (scope) => {
      scope.paginate = {
        limit: scope.pagination.limit,
        offset: scope.pagination.offset,
        total: scope.pagination.total,
      };
      
      
      scope.filter = {
        bound: false,
        states: 'ready,active,presented',
        search: null,
      };
  
      scope.loading = false;
      
      scope.clearSearch = () => {
        scope.showSearch = false;
        scope.focusSearch = false;
        
        scope.paginate.offset = 0;
    
        const filterCache = scope.filter.search;
    
        scope.filter.search = null;
        if (filterCache !== undefined) scope.refreshReports();
      };
  
      scope.displaySearch = () => {
        scope.showSearch = true;
        scope.focusSearch = true;
      };
      
      
      scope.prevPage = () => {
        scope.paginate.offset -= scope.paginate.limit;
        scope.refreshReports();
      };
      
      scope.nextPage = () => {
        scope.paginate.offset += scope.paginate.limit;
        scope.refreshReports();
      };
      
      
      scope.search = () => {
        scope.paginate.offset = 0;
        scope.refreshReports();
      };
  
      scope.readState = (s) => {
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
      };
      
      /**
       * Call API and refresh reports
       *
       * Makes call to IPR API with filters and pagination
       *
       * @returns {undefined}
       */
      scope.refreshReports = $async(async () => {
        const opts = {};
        
        scope.loading = true;
        
        opts.type = scope.type;
        opts.states = scope.filter.states;
        opts.project = scope.filter.project;
        opts.paginated = true;
        opts.offset = scope.paginate.offset;
        opts.limit = scope.paginate.limit;
        
        
        if (!scope.filter.bound) opts.all = true;
        if (scope.filter.search) opts.searchText = scope.filter.search;
        
        if (scope.clinician) {
          if (scope.type === 'genomic') opts.states = 'presented,archived';
          if (scope.type === 'probe') opts.states = 'reviewed';
        }
        try {
          const reportResults = await $report.all(opts);

          scope.paginate.total = reportResults.total;
          scope.reports = reportResults.reports;
              
          scope.loading = false;
        } catch (err) {
          $mdToast.showSimple(`An error occurred when loading reports: ${err.message}`);
          scope.loading = false;
        }
      });
    }, // end link
  }; // end return
}]);
