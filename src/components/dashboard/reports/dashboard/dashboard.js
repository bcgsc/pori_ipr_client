app.controller('controller.dashboard.reports.dashboard', ['_', '$q', '$rootScope', '$scope', '$state', 'reports', (_, $q, $rootScope, $scope, $state, reports) => {
  
  reports = _.orderBy(reports, ['state', 'patientInformation.caseType', 'analysis.pog.POGID'], ['asc', 'desc', 'asc']);

  $scope.currentCases = reports;
  $scope.upstreamCases = [];
  
  $rootScope.$watch('_externalMode', (newVal, oldVal) => {
    if(newVal) $state.go('dashboard.reports.genomic');
  });

}]);
