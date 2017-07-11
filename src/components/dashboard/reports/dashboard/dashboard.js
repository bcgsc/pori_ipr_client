app.controller('controller.dashboard.reports.dashboard', ['_', '$q', '$scope', 'reports', (_, $q, $scope, reports) => {


  reports = _.orderBy(reports, ['state','analysis.pog.POGID']);

  $scope.currentCases = reports;
  $scope.upstreamCases = [];

}]);
