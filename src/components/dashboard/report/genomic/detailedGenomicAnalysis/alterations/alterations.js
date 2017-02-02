app.controller('controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations', 
  ['_', '$scope', '$mdDialog', '$mdToast', 'alterations', (_, $scope, $mdDialog, $mdToast, $alterations) => {
  
  console.log('Loaded Genomic/DGA/APC controller!');
  
  let pog = 'POG129';
  $scope.pog = pog;
  $scope.genes = {};
  
  $scope.alterationUpdate = ($event, gene) => {
    
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/reports/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
      locals: {
        pog: pog,
        gene: gene
      },
      clickOutToClose: false,
      controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit'
    }).then((outcome) => {
      if(outcome) $mdToast.show($mdToast.simple().textContent(outcome));
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  }
  
  
  alterations.forEach((row) => {
        
    // Check if it exists already?
    if(!(row.gene+'-'+row.variant in $scope.genes)) {
      row.children = [];
      return $scope.genes[row.gene+'-'+row.variant] = row;
    }
    
    
    if(row.gene+'-'+row.variant in $scope.genes) {
      return $scope.genes[row.gene+'-'+row.variant].children[$scope.genes[row.gene+'-'+row.variant].children.length] = row;
    }
    
  });
  
  
}]);
