app.controller('controller.dashboard.reports.dashboard', ['_', '$q', '$scope', 'reports', (_, $q, $scope, reports) => {


  reports = _.orderBy(reports, ['state', 'patientInformation.caseType', 'analysis.pog.POGID'], ['asc', 'desc', 'asc']);

  $scope.currentCases = reports;
  $scope.upstreamCases = [];

}]);
