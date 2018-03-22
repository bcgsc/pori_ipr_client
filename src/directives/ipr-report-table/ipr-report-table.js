app.directive("iprReportTable", ['$q', '_', 'api.pog_analysis_report', ($q, _, $report) => {
  
  return {
    restrict: 'E',
    transclude: false,
    scope: {
      reports: '=reports',
      clinician: '=clinician',
      pagination: '=?pagination'
    },
    templateUrl: 'ipr-report-table/ipr-report-table.html',
    link: (scope, element, attr) => {
      
      scope.paginate = {
        limit: scope.pagination.limit,
        offset: scope.pagination.offset,
        total: scope.pagination.total
      };
      
      
      scope.filter = {
        bound: false,
        states: 'ready,active,presented',
        search: null
      };
  
      scope.loading = false;
      
      scope.clearSearch = () => {
        scope.showSearch = false;
        scope.focusSearch = false;
        
        scope.paginate.offset = 0;
    
        let filterCache = scope.filter.search;
    
        scope.filter.search = null;
        if(filterCache !== undefined) scope.refreshReports();
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
        switch(s) {
          case 'ready':
            return 'Ready for Analysis';
            break;
      
          case 'active':
            return 'Analysis underway';
            break;
      
          case 'presented':
            return 'Presentation';
            break;
      
          case 'archived':
            return 'Archived';
            break;
      
          default:
            return 'N/A';
            break;
        }
      };
      
      /**
       * Call API and refresh reports
       *
       * Makes call to IPR API with filters and pagination
       */
      scope.refreshReports = () => {
        
        let opts = {};
        
        scope.loading = true;
        
        opts.states = scope.filter.states;
        opts.project = scope.filter.project;
        opts.paginated = true;
        opts.offset = scope.paginate.offset;
        opts.limit = scope.paginate.limit;
        
        
        if(!scope.filter.bound) opts.all = true;
        if(scope.filter.search) opts.searchText = scope.filter.search;
        
        if(scope.clinician) opts.states = 'presented,archived';
        
        $report.all(opts)
          .then((result) => {
            scope.paginate.total = result.total;
            scope.reports = result.reports;
            
            scope.loading = false;
          })
          .catch((err) => {
          
          });
        
      }
      
    } // end link
  }; // end return
  
}]);
