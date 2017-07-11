app.controller('controller.dashboard.reports.dashboard', ['_', '$q', '$scope', 'reports', (_, $q, $scope, reports) => {

  $scope.currentCases = reports;
  $scope.upstreamCases = [];

}]);
