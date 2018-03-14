app.controller('controller.dashboard.germline.board',
['$q', '_', '$scope', '$window', '$timeout', 'api.germline.report', '$mdDialog', '$mdToast', 'reports',
($q, _, $scope, $window, $timeout, $report, $mdDialog, $mdToast, reports) => {
  
  $scope.reports = _.sortBy(
    reports.reports, 
    [function(report) { return parseInt(report.analysis.pog.POGID.match(/\d+/)[0]) }] // perform natural sorting on POGID
  ).reverse(); // reverse sort order
  
  $scope.loading = false;
  $scope.showSearch = true;
  $scope.focusSearch = false;
  $scope.filter = {
    search: null,
  };
  
  $scope.paginate = {
    total: reports.total,
    offset: 0,
    limit: 25
  };
  
  $scope.clearSearch = () => {
    //$scope.showSearch = false;
    $scope.focusSearch = false;
    
    let filterCache = $scope.filter.search;
    
    $scope.filter.search = null;
    if(filterCache !== undefined) $scope.refreshReports();
  };
  
  $scope.displaySearch = () => {
    $scope.showSearch = true;
    $scope.focusSearch = true;
  };
  
  $scope.hasReview = (report, type) => {
    return (_.find(report.reviews, {type: type}) !== undefined) ? true : false;
  };
  
  $scope.unsetExported = (report) => {
    if(report.exported === false) return;
    
    report.exported = false;
    
    let report_cache = angular.copy(report);
    report_cache.biofx_assigned = report.biofx_assigned.ident;
    
    $report.update(report_cache.analysis.pog.POGID, report_cache.analysis.analysis_biopsy, report_cache.ident, report_cache)
      .then((result) => {
        let i = _.findKey($scope.reports, {ident: report_cache.ident});
        
        $scope.reports[i] = result;
        
      })
      .catch((e) => {
        report.exported = true;
        $mdToast.showSimple('Failed to update report exported status.');
        console.log(e);
      });
    
  };
  
  
  /**
   * Update search criteria and trigger reload
   */
  $scope.search = () => {
    $scope.refreshReports();
  };
  
  /**
   * Reload tracking data from API
   *
   */
  $scope.refreshReports = () => {
    
    // start from first page of paginator if performing search
    if ($scope.filter.search) $scope.paginate.offset = 0;

    let opts = {
      //offset: $scope.paginate.offset, // sequelize applies limit and offset to subquery, returning incorrect results
      //limit: $scope.paginate.limit,
      search: $scope.filter.search
    };
    
    $report.all(opts).then(
      (reports) => {
        $scope.paginate.total = reports.total;
        // have to manually extract reports based on limit/offset due to sequelize bug
        let start = $scope.paginate.offset,
            finish = $scope.paginate.offset + $scope.paginate.limit;
        let sortedReports = _.sortBy(
          reports.reports, 
          [function(report) { return parseInt(report.analysis.pog.POGID.match(/\d+/)[0]) }] // perform natural sorting on POGID
        ).reverse(); // reverse sort order
        $scope.reports = sortedReports.slice(start, finish);
      },
      (err) => {
        console.log('Failed to get updated definitions', err);
      }
    )
    
  };
  
  // Trigger download pipe
  $scope.getExport = () => {
    $report.flash_token()
      .then((token) => {
        // Open a window for the user with the special url
        $window.open(`${CONFIG.ENDPOINTS.API}/export/germline_small_mutation/batch/download?reviews=biofx,projects&flash_token=${token.token}`, '_blank');
        
        $timeout(() => {
          $scope.refreshReports();
        }, 500);
      })
      .catch((e) => {
        $mdToast.showSimple('Failed to retrieve the downloadable export');
        console.log(e);
      });
  }
  
  
}]);