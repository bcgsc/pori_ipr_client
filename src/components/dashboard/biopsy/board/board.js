app.controller('controller.dashboard.biopsy.board', ['$q', '_', '$scope', 'api.lims', '$mdDialog', '$mdToast', ($q, _, $scope, $lims, $mdDialog, $mdToast) => {
  
  $scope.pogs = {};
  $scope.searching = false;
  
  $scope.numKeys = (obj) => {
    return Object.keys(obj).length;
  };
  
  $scope.search = () => {
    
    $scope.searching = true;
    $scope.pogs = {};
    
    
    $lims.sample([$scope.biopsy.search]).then(
      (result) => {
        // Empty map
        $scope.pogs = {};
        
        _.forEach(result.results, (r) => {
        
          if(!$scope.pogs[r.original_source_name]) {
          
            $scope.pogs[r.original_source_name] = {
              pogid: r.participant_study_id,
              sample_name: r.original_source_name,
              date: r.sample_collection_time,
              anatomic_site: r.anatomic_site,
              disease: r.disease,
              libraries: [r.library]
            }
          }
        
          if($scope.pogs[r.original_source_name] && $scope.pogs[r.original_source_name].libraries.indexOf(r.library) === -1) {
            $scope.pogs[r.original_source_name].libraries.push(r.library);
          }
        
        });
  
        $scope.searching = false;
      
        console.log('POGs', $scope.pogs);
      },
      (err) => {
        console.log("Error", err);
      }
    )
    
  };
  
  $scope.openLibrary = (lib) => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.library.html',
      controller: ['$scope', (scope) => {
        
        scope.loading = true;
        scope.library = {name: lib};
        
        scope.cancel = () => {
          $mdDialog.cancel();
        };
        
        $lims.library(lib).then(
          (result) => {
            
            if(result.hits === 0) {
              $mdToast.show($mdToast.simple().textContent('Unable to lookup the requested library'));
              $mdDialog.cancel();
            }
            
            scope.loading = false;
            scope.library = result.results[0];
          })
          .catch((err) => {
            console.log('Err querying library', err);
          });
        
      }]
    })
    
  }
  

}]);