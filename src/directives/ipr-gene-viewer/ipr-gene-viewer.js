app.directive("iprGeneViewer", ['$q', '$parse', '$timeout', '$mdDialog', '_', ($q, $parse, $timeout, $mdDialog, _) => {
  
  return {
    restrict: 'E',
    scope: {
      pog: '=pog',
      report: '=report',
      gene: '=gene'
    },
    transclude: true,
    template: '<span ng-click="openDialog()" ng-transclude style="margin: 0 3px;" title="Open Gene Viewer"></span>',
    link: (scope, element, attr) => {
      
      scope.openDialog = () =>{
        $mdDialog.show({
          controller: 'controller.iprGeneViewer',
          clickOutsideToClose: true,
          locals: {
            report: scope.report,
            gene: scope.gene,
            pog: scope.pog
          },
          templateUrl: 'ipr-gene-viewer/ipr-gene-viewer.dialog.html'
        });
      };
    },
  } // end return
  
}]);

// Dialog Controller
app.controller("controller.iprGeneViewer", ['$q', '_', '$scope', '$mdDialog', 'api.geneViewer', 'report', 'pog', 'gene', ($q, _, $scope, $mdDialog, $gv, report, pog, gene) => {
  
  $scope.loading = true;
  $scope.report = report;
  $scope.pog = pog;
  $scope.gene = gene;
  $scope.samples = [];
  $scope.alterations = {therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: {}};
  
  
  // Group Entries by Type
  let groupEntries = (alterations) => {
    // Process the entries for grouping
    alterations.forEach((row) => {
      
      // Add to samples if not present
      if($scope.samples.indexOf(row.sample) === -1) $scope.samples.push(row.sample);
      
      // Grouping
      if(!(row.alterationType in $scope.alterations)) $scope.alterations[row.alterationType] = {};
      
      
      // Check if it exists already?
      if(!(row.gene+'-'+row.variant in $scope.alterations[row.alterationType])) {
        row.children = [];
        return $scope.alterations[row.alterationType][row.gene+'-'+row.variant] = row;
      }
      
      // Categorical entry already exists
      if(row.gene+'-'+row.variant in $scope.alterations[row.alterationType]) {
        return $scope.alterations[row.alterationType][row.gene+'-'+row.variant]
          .children[$scope.alterations[row.alterationType][row.gene+'-'+row.variant].children.length] = row;
      }
      
    });
    
    _.forEach($scope.alterations, (values, k) => {
      $scope.alterations[k] = _.values(values);
      //console.log('Iteree: ', k, values, _.values(values));
    });
    
  };
  
  $gv.get(pog.POGID, report.ident, gene).then(
    (result) => {
      $scope.data = result;
      $scope.loading = false;
      
      // Group KB match Entries
      groupEntries($scope.data.kbMatches);
      
    }
  );
  
  
  $scope.cancel = () => {
    $mdDialog.cancel();
  }
  
}]);