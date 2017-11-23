app.controller('controller.dashboard.reports.dashboard', ['_', '$q', '$rootScope', '$scope', '$state', 'reports', (_, $q, $rootScope, $scope, $state, reports) => {


  reports = _.orderBy(reports, ['state', 'patientInformation.caseType', 'analysis.pog.POGID'], ['asc', 'desc', 'asc']);

  $scope.currentCases = reports;
  $scope.upstreamCases = [];
  
  // Push clinicians to case viewer
  if($rootScope._clinicianMode) $state.go('dashboard.reports.genomic');
  $rootScope.$watch('_clinicianMode', (newVal, oldVal) => {
    if(newVal) $state.go('dashboard.reports.genomic');
  });

}]);
