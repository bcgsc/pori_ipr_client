app.controller('controller.dashboard.report.genomic', 
  ['_', '$q', '$scope', '$state', 'api.pog', 'pog',
  (_, $q, $scope, $state, $pog, pog) => {

  $scope.pog = pog;
  $scope.goToReportSection = (goto) => {
    
    $state.go('^.' + goto);
    
  }
  
}]);
