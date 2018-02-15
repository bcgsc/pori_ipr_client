app.controller('controller.dashboard.biopsy.board.edit',
['$scope', '_', '$q', '$mdDialog', '$mdToast', 'api.lims', 'api.bioapps', 'api.analysis', 'api.pog', 'analysis', '$filter',
($scope, _, $q, $mdDialog, $mdToast, $lims, $bioapps, $analysis, $pog, analysis, $filter) => {
  
  $scope.patient = analysis;

  // If analysis has biopsy number, make analysis biopsy and libraries required fields
  $scope.patient.tracking = true;
  if($scope.patient.analysis_biopsy) { $scope.patient.tracking = false; }
  
  let threeLetterCodes = [
    {"code": "BRC", "description": "Breast"},
    {"code": "CNS", "description": "Central nervous system"},
    {"code": "GIC", "description": "Gastrointestinal"},
    {"code": "GUC", "description": "Genitourinary"},
    {"code": "GYN", "description": "Gynecological"},
    {"code": "H&N", "description": "Head and neck"},
    {"code": "HEM", "description": "Hematological"},
    {"code": "NEU", "description": "Neurological"},
    {"code": "PAN", "description": "Pancreatic"},
    {"code": "PRO", "description": "Prostate"},
    {"code": "PUO", "description": "Primary unknown"},
    {"code": "SAR", "description": "Sarcoma"},
    {"code": "SKN", "description": "Skin"},
    {"code": "THR", "description": "Thoracic"}
  ];

  // convert Cancer Group (3 Letter Code) field to uppercase
  $scope.$watch('cancerGroupQuery', function (val) {
      $scope.cancerGroupQuery = $filter('uppercase')(val);
  }, true);
  
  // Close Dialog
  $scope.cancel = () => { $mdDialog.cancel(); };
  
  // Search Disease Endpoint
  $scope.searchDisease = (searchText) => {
    return $q((resolve, reject) => {
      if(searchText.length === 0) return [];
      
      $lims.diseaseOntology(searchText).then(
        (resp) => { resolve(resp.results); },
        (err) => { console.log(err); reject(); }
      );
    });
  };
  
  // Search Three Letter Code with auto complete
  $scope.searchGroups = (searchText) => {
    return _.filter(threeLetterCodes, (e) => {
      if(e.code.indexOf(searchText.toUpperCase()) > -1) return e;
    });
  };
  
  /**
   * Select collection and auto-populate
   *
   * @param collection
   */
  $scope.selectCollection = (collection) => {    
    $scope.patient.libraries.normal = collection.normal.name;
    $scope.patient.libraries.tumour = collection.tumour.name;
    $scope.patient.libraries.transcriptome = collection.transcriptome.name;
  };
  
  // Submit Biopsy Entry
  $scope.save = (f) => {

    // Touch required fields to invoke validation
    _.each($scope.PatientForm.$error.required, (field) => {
      field.$setTouched();
    });

    // Check if form is valid
    if(!$scope.PatientForm.$valid) {
      $scope.sending = false;
      return; // don't submit invalid form
    }
    
    // Setup submission object
    analysis.priority = $scope.patient.priority;
    analysis.clinical_biopsy = $scope.patient.clinical_biopsy;
    analysis.analysis_biopsy = $scope.patient.analysis_biopsy;
    analysis.disease = (typeof $scope.patient.disease === 'object') ? $scope.patient.disease.text : $scope.patient.disease;
    analysis.biopsy_notes = $scope.patient.biopsy_notes;
    analysis.biopsy_date = $scope.patient.biopsy_date;
    analysis.notes = $scope.patient.notes;
    analysis.libraries.normal = $scope.patient.libraries.normal;
    analysis.libraries.tumour = $scope.patient.libraries.tumour;
    analysis.libraries.transcriptome = $scope.patient.libraries.transcriptome;
    analysis.threeLetterCode = (typeof $scope.patient.threeLetterCode === 'object') ? $scope.patient.threeLetterCode.code : $scope.patient.threeLetterCode;
    analysis.date_presentation = $scope.patient.date_presentation;
    analysis.onco_panel_submitted = $scope.patient.onco_panel_submitted;
    analysis.date_analysis = $scope.patient.date_analysis;
    
    // Add libraries and biop if not tracking
    if(!$scope.patient.tracking) {
      analysis.libraries = $scope.patient.libraries;
      analysis.analysis_biopsy = $scope.patient.analysis_biopsy;
    }
    
    $analysis.update(analysis)
      .then((result) => {
        $mdDialog.hide({analysis: result});
      })
      .catch((err) => {
        $mdToast.show($mdToast.simple().textContent('Something went wrong! We were unable to add new biopsy.'));
      });
    
  }

}]);