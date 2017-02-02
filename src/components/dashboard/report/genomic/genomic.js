app.controller('controller.dashboard.report.genomic', 
  ['_', '$q', '$scope', '$state', 'api.pog', 'pog',
  (_, $q, $scope, $state, $pog, pog) => {
  
  console.log('Loaded dashboard genomic report controller');
  
  $scope.pog = pog;
  
  $scope.goToReportSection = (goto) => {
    
    $state.go('dashboard.report.genomic.' + goto);
    
  }
  
}]);
