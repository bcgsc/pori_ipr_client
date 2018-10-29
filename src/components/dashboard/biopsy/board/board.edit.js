app.controller('controller.dashboard.biopsy.board.edit',
['$scope', '_', '$q', '$mdDialog', '$mdToast', 'api.lims', 'api.bioapps', 'api.analysis', 'api.pog', 'api.project', 'analysis', '$filter', 'projects', '$http', 
($scope, _, $q, $mdDialog, $mdToast, $lims, $bioapps, $analysis, $pog, $project, analysis, $filter, projects, $http) => {
  
  $scope.patient = angular.copy(analysis);
  $scope.projects = projects;
  $scope.patient.projects = $scope.patient.pog.projects
  $scope.patient.alternate_identifier = $scope.patient.pog.alternate_identifier;
  $scope.patient.age_of_consent = $scope.patient.pog.age_of_consent;

  // If analysis has biopsy number, make analysis biopsy and libraries required fields
  $scope.patient.tracking = true;
  if($scope.patient.analysis_biopsy) { $scope.patient.tracking = false; }

  // Fields to validate
  $scope.validate = {
    project: true,
    disease: !!analysis.disease, // only validate if field has already been filled out
    cancer_group: !!analysis.threeLetterCode,
    clinical_biopsy: !!analysis.clinical_biopsy,
    biofx_biopsy: !!analysis.analysis_biopsy,
    biopsy_date: !!analysis.biopsy_date,
    normal_library: !!analysis.libraries.normal,
    tumour_library: !!analysis.libraries.tumour,
    transcriptome_library: !!analysis.libraries.transcriptome
  }
  
  let threeLetterCodes = [];

  $http.get('../assets/json/threeLetterCodes.json')
  .then((result) => {
    threeLetterCodes = _.sortBy(result.data, ['code']);
  });  

  // convert Cancer Group (3 Letter Code) field to uppercase
  $scope.$watch('cancerGroupQuery', function (val) {
      $scope.cancerGroupQuery = $filter('uppercase')(val);
  }, true);

  // convert Pediatric ID field to uppercase
  $scope.$watch('patient.pediatric_id', function (val) {
      $scope.patient.pediatric_id = $filter('uppercase')(val);
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
    analysis.disease = (typeof $scope.patient.disease === 'object' && $scope.patient.disease) ? $scope.patient.disease.text : $scope.patient.disease;
    analysis.biopsy_notes = $scope.patient.biopsy_notes;
    analysis.biopsy_date = $scope.patient.biopsy_date;
    analysis.notes = $scope.patient.notes;
    analysis.libraries.normal = $scope.patient.libraries.normal;
    analysis.libraries.tumour = $scope.patient.libraries.tumour;
    analysis.libraries.transcriptome = $scope.patient.libraries.transcriptome;
    analysis.threeLetterCode = (typeof $scope.patient.threeLetterCode === 'object' && $scope.patient.threeLetterCode) ? $scope.patient.threeLetterCode.code : $scope.patient.threeLetterCode;
    analysis.date_presentation = $scope.patient.date_presentation;
    analysis.onco_panel_submitted = $scope.patient.onco_panel_submitted;
    analysis.date_analysis = $scope.patient.date_analysis;
    analysis.pediatric_id = $scope.patient.pediatric_id;
    
    // Add libraries and biop if not tracking
    if(!$scope.patient.tracking) {
      analysis.libraries = $scope.patient.libraries;
      analysis.analysis_biopsy = $scope.patient.analysis_biopsy;
    }
    
    $analysis.update(analysis)
      .then((result) => {
        // Analysis updated, update POG project binding if necessary
        let oldProjects = analysis.pog.projects;

        // unbind from projects no longer in list
        let unbind = _.differenceBy(oldProjects, $scope.patient.projects, 'ident');
        _.each(unbind, function(project) {
          $project.pog(project.ident).remove(analysis.pog.ident).then(
            (resp) => {
            },
            (err) => {
              $mdToast.showSimple('Patient was not removed from project ' + project.name);
              console.log('Unable to remove pog from project', err);
            }
          );
        });

        // bind to new projects in list
        let bind = _.differenceBy($scope.patient.projects, oldProjects, 'ident');
        _.each(bind, function(project) {
          $project.pog(project.ident).add(analysis.pog.ident).then(
            (resp) => {
            },
            (err) => {
              $mdToast.showSimple('Patient was not added to project ' + project.name);
              console.log('Unable to add pog to project', err);
            }
          );
        });

        result.pog.projects = $scope.patient.projects;

        // update POG alternate id and/or age of consent if necessary
        if((analysis.pog.alternate_identifier !== $scope.patient.alternate_identifier) || (analysis.pog.age_of_consent !== $scope.patient.age_of_consent)) {
          let updatePOG = {
            POGID: analysis.pog.POGID,
            ident: analysis.pog.ident,
            alternate_identifier: $scope.patient.alternate_identifier,
            age_of_consent: $scope.patient.age_of_consent
          }

          $pog.update(updatePOG).then((pogRes) => {
              result.pog.alternate_identifier = pogRes.alternate_identifier;
              result.pog.age_of_consent = pogRes.age_of_consent;
              $mdDialog.hide({analysis: result});
          });
        } else {
          $mdDialog.hide({analysis: result});
        }
      })
      .catch((err) => {
        console.log(err);
        $mdToast.show($mdToast.simple().textContent('Something went wrong! We were unable to add new biopsy.'));
      });
    
  }

}]);