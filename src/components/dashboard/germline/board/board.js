app.controller('controller.dashboard.germline.board', ['$q', '_', '$scope', 'api.germline.report', '$mdDialog', '$mdToast', 'reports', ($q, _, $scope, $report, $mdDialog, $mdToast, reports) => {
  
  $scope.reports = reports.reports;
  
  $scope.loading = false;
  $scope.showSearch = false;
  $scope.focusSearch = false;
  $scope.filter = {
    search: null,
    project: 'POG'
  }
  
  console.log('Reports', $scope.reports);
  
  $scope.paginate = {
    total: reports.total,
    offset: 0,
    limit: 25
  };
  
  $scope.clearSearch = () => {
    $scope.showSearch = false;
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
    
    let opts = {
      offset: $scope.paginate.offset,
      limit: $scope.paginate.limit,
      project: 'POG',
      search: $scope.filter.search
    };
    
    
    $report.all(opts).then(
      (reports) => {
        $scope.paginate.total = reports.total;
        $scope.reports = reports.reports;
      },
      (err) => {
        console.log('Failed to get updated definitions', err);
      }
    )
    
  };
  
  
}]);