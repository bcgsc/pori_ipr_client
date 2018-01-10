app.controller('controller.dashboard.biopsy.board.edit_comparator',
['$scope', '_', '$q', '$mdDialog', '$mdToast', 'api.analysis', 'api.pog', 'analysis',
($scope, _, $q, $mdDialog, $mdToast, $analysis, $pog, analysis) => {
  
  $scope.patient = analysis;
  
  $scope.disease_comparators = analysis.comparator_disease.all;
  
  $scope.comparator_search = {
    normal_primary: $scope.patient.comparator_normal.normal_primary[0],
    normal_biopsy: $scope.patient.comparator_normal.normal_biopsy[0],
    gtex_primary: $scope.patient.comparator_normal.gtex_primary[0],
    gtex_biopsy: $scope.patient.comparator_normal.gtex_biopsy[0],
  };
  
  // Close Dialog
  $scope.cancel = () => { $mdDialog.cancel(); };
  
  // Search Disease Endpoint
  $scope.searchComparators = (searchText) => {
    return $q((resolve, reject) => {
      if(searchText.length === 0) return [];
      
      $analysis.comparators()
        .then((resp) => {
          resolve(_.filter(resp.v9, (c) => {
            if(c.code.indexOf(searchText) > -1) return c;
          }));
        })
        .catch((err) => {
          console.log(err); reject();
        });
    });
  };
  
  // Search Disease Endpoint
  $scope.searchNormalComparators = (searchText) => {
    return $q((resolve, reject) => {
      if(searchText.length === 0) return [];
      
      $analysis.comparators()
        .then((resp) => {
          resolve(_.filter(resp.v8.bodymap.normal, (c) => {
            if(c.indexOf(searchText) > -1) return c;
          }));
        })
        .catch((err) => {
          console.log(err); reject();
        });
    });
  };
  
  // Search Disease Endpoint
  $scope.searchGtexComparators = (searchText) => {
    return $q((resolve, reject) => {
      if(searchText.length === 0) return [];
      
      $analysis.comparators()
        .then((resp) => {
          resolve(_.filter(resp.v8.gtex.normal, (c) => {
            if(c.indexOf(searchText) > -1) return c;
          }));
        })
        .catch((err) => {
          console.log(err); reject();
        });
    });
  };
  
  // Mark comparator as for analysis
  $scope.select_for_analysis = (c) => {
    $scope.patient.comparator_disease.analysis = c;
    console.log('Setting for analysis', c, $scope.patient);
  };
  
  // Add found comparator to array
  $scope.add_comparator = () => {
    // Is it already in the array?
    if($scope.disease_comparators.indexOf($scope.comparator_search.entry.code) > -1) return $scope.comparator_search.entry = null;
    
    // Add to array
    $scope.disease_comparators.push($scope.comparator_search.entry.code);
    $scope.comparator_search.entry = null;
  };
  
  // Remove Disease Comparator
  $scope.remove_comp = (c) => {
    $scope.disease_comparators.splice($scope.disease_comparators.indexOf(c),1);
  };
  
  // Submit Biopsy Entry
  $scope.save = (f) => {
    
    let patient = angular.copy($scope.patient);
    
    // Setup submission object
    analysis.comparator_disease = {
      analysis: patient.comparator_disease.analysis,
      all: $scope.disease_comparators,
      tumour_type_report: patient.comparator_disease.tumour_type_report,
      tumour_type_kb: patient.comparator_disease.tumour_type_kb
    };
    analysis.comparator_normal = {
      normal_primary: [$scope.comparator_search.normal_primary],
      normal_biopsy: [$scope.comparator_search.normal_biopsy],
      gtex_primary: [$scope.comparator_search.gtex_primary],
      gtex_biopsy: [$scope.comparator_search.gtex_biopsy]
    };
    
    $analysis.update(analysis)
      .then((result) => {
        $mdDialog.hide({analysis: result});
      })
      .catch((err) => {
        $mdToast.show($mdToast.simple().textContent('Something went wrong! We were unable to add new biopsy.'));
      });
    
  }

}]);