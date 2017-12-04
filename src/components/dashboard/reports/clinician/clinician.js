app.controller('controller.dashboard.reports.clinician', ['_', '$q', '$rootScope', '$scope', '$state', 'reports', (_, $q, $rootScope, $scope, $state, reports) => {
  
  $scope.reports = _.orderBy(reports.reports, ['pog.POGID', 'createdAt'], ['desc', 'desc']);
  
  $scope.pagination = {
    offset: 0,
    limit: 25,
    total: reports.total
  };
  
}]);
