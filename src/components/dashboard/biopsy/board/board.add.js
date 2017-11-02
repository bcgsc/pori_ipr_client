app.controller('controller.dashboard.biopsy.board.add',
['$scope', '_', '$q', 'api.lims', 'api.bioapps', 'api.analysis', 'api.pog', '$mdDialog', '$mdToast',
($scope, _, $q, $lims, $bioapps, $analysis, $pog, $mdDialog, $mdToast) => {
  
  $scope.stages = [
    {title: 'Patient', description: 'Meta data about the patient', id: "patient", ordinal: 0},
    {title: 'Details', description: 'Detailed information (optional)', id: "details", ordinal: 1}
  ];
  let activeStage = $scope.activeStage = 0;
  
  $scope.patient = { POGID: null, clinical_biopsy: 'clinspec_', tracking: true, comparators: false, libraries: {} };
  $scope.detail = {};
  $scope.source_loading = false;
  $scope.show_sources = false;
  $scope.searchPogcache = null;
  
  $scope.find_libraries = false;
  $scope.found_libraries = [];
  $scope.libraries_loading = false;
  
  $scope.events = {
    valid: false,
    dirty: true,
    pristine: true,
  };
  
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
  
  $scope.$watch('patient.tracking', (newVal, oldVal) => {
    
    if(newVal === false && oldVal === true) {
      $scope.patient.analysis_biopsy = 'biop';
    } else {
      $scope.patient.analysis_biopsy = null;
    }
  });
  
  // Close Dialog
  $scope.cancel = () => { $mdDialog.cancel(); };
  
  // Search Users with auto complete
  $scope.searchPOGs = (searchText) => {
    
    return $q((resolve, reject) => {
      if(searchText.length === 0) return [];
      
      $pog.all({query: searchText, all: true}).then(
        (resp) => { resolve(resp); },
        (err) => { console.log(err); reject(); }
      );
    });
  };
  
  // Search Disease Endpoint
  $scope.searchDisease = (searchText) => {
    return $q((resolve, reject) => {
      if(searchText.length === 0) return [];
      
      console.log('Search Text: ', searchText);
      
      $lims.diseaseOntology(searchText).then(
        (resp) => { resolve(resp.results); },
        (err) => { console.log(err); reject(); }
      );
    });
  };
  
  // Search Users with auto complete
  $scope.searchGroups = (searchText) => {
    return _.filter(threeLetterCodes, (e) => {
      if(e.code.indexOf(searchText) > -1) return e;
    });
  };
  
  // Find LIMS Sources
  $scope.limsSources = () => {
    
    // Check to see if this is the same value
    if($scope.searchPogcache === $scope.searchQuery || $scope.searchQuery.length === 0) return; // Same value, btfo!
    
    console.log('Searching', $scope.searchQuery);
    
    $scope.source_loading = true;
    $scope.show_sources = true;
    $scope.pog_sources = [];
    
    // Find LIMS sources for this POGID
    $lims.source($scope.searchQuery)
      .then((result) => {
        let sources = {};
        
        _.forEach(result.results, (s) => {
          sources[s.original_source_name] = s;
        });
        
        $scope.source_loading = false;
        $scope.pog_sources = _.values(sources);
        $scope.searchPogcache = $scope.searchQuery;
      })
      .catch((err) => {
        console.log('Failed to lookup POG sources');
      });
  };
  
  // Move back a stage
  $scope.lastStage = () => {
    $scope.activeStage--;
  };
  
  // Move forward a stage
  $scope.nextStage = () => {
    let form;
    // Try to trigger submit...
    switch ($scope.activeStage) {
      case 1:
        form = $scope.referenceForm;
        break;
      case 0:
        form = $scope.matching;
        break;
    }
    
    form.$setSubmitted();
    if (form.$valid) {
      $scope.activeStage++;
    }
  };
  
  // Attempt to guess library names
  $scope.libraryGuess = () => {
    
    $scope.find_libraries = true;
    $scope.libraries_loading = true;
    
    let diseaseLibraries = [];
    let pogs = {};
    
    let pogid = ($scope.patient.POGID) ? $scope.patient.POGID.POGID : $scope.searchQuery;
    
    $lims.sample([pogid])
      .then((result) => {
        return $q((resolve, reject) => {
          _.forEach(result.results, (sample) => {
            
            let pogid = sample.participant_study_id;
            let datestamp = sample.sample_collection_time.substring(0,10);
            
            let library = {
              name: sample.library,
              type: (sample.disease_status === 'Normal') ? 'normal' : null,
              source: sample.original_source_name,
              disease: sample.disease,
              sample_collection_time: sample.sample_collection_time
            };
            
            if(sample.disease_status === 'Diseased' && diseaseLibraries.indexOf(sample.library) === -1) {
              diseaseLibraries.push(sample.library);
            }
            
            // Check if pog has been seen yet in this cycle
            if(!pogs[pogid]) pogs[pogid] = {};
            
            // Check if this biopsy event date
            if(!pogs[pogid][datestamp]) pogs[pogid][datestamp] = [];
            
            // Has this library name been listed yet?
            if(!_.find(pogs[pogid][datestamp], {name: library.name})) {
              pogs[pogid][datestamp].push(library);
            }
            
          });
          resolve(diseaseLibraries)
        });
      })
      .then($lims.library)
      .then((result) => {
        return $q((resolve, reject) => {
          
          // Loop over found libraries
          _.forEach(result.results, (library) => {
            
            // Grab associated POG biopsies
            let pog = pogs[library.full_name.split('-')[0]];
            
            // Loop over biopsies
            _.forEach(pog, (libraries, biopsy_date) => {
              
              // The index key of the library we're looking for
              let i = _.findKey(libraries, {name: library.name});
              
              // If the index is valid, store the updated data
              if(i) {
                // Types of library strategy mappings
                if(library.library_strategy === 'WGS') pogs[library.full_name.split('-')[0]][biopsy_date][i].type = 'tumour';
                if(library.library_strategy.indexOf('RNA') > -1) pogs[library.full_name.split('-')[0]][biopsy_date][i].type = 'transcriptome';
              }
              
            });
            
          });
          
          resolve();
          
        });
      })
      .then(() => {
        
        // Did we find anything?
        if(!pogs[pogid]) return;
        let pog_libs = pogs[pogid];
        
        // Organize into object
        _.forEach(pog_libs, (libs, date) => {
          
          let normal = _.find(libs, {type: 'normal'});
          let tumour = _.find(libs, {type: 'tumour'});
          let transcriptome = _.find(libs, {type: 'transcriptome'});
          
          $scope.found_libraries.push({collection_date: date, normal: normal, tumour: tumour, transcriptome: transcriptome});
          
        });
        
        $scope.libraries_loading = false;
        
      })
      .catch((err) => {
        console.log('failed to find/guess libraries', err);
        
        $scope.libraries_loading = false;
      });
    
  };
  
  /**
   * Select collection and auto-populate
   *
   * @param collection
   */
  $scope.selectCollection = (collection) => {
    
    console.log('Collection', collection);
    
    $scope.patient.libraries.normal = collection.normal.name;
    $scope.patient.libraries.tumour = collection.tumour.name;
    $scope.patient.libraries.transcriptome = collection.transcriptome.name;
  };
  
  // Submit Biopsy Entry
  $scope.submit = (f) => {
    
    // Setup submission object
    let analysis = {
      POGID: ($scope.patient.POGID) ? $scope.patient.POGID.POGID : $scope.searchQuery,
      clinical_biopsy: $scope.patient.clinical_biopsy,
      disease:  (typeof $scope.patient.disease === 'object') ? $scope.patient.disease.text : $scope.patient.disease,
      biopsy_notes: $scope.patient.biopsy_notes,
      tracking: $scope.patient.tracking,
      notes: $scope.patient.notes,
      libraries: null
    };
    
    // Add libraries and biop if not tracking
    if(!$scope.patient.tracking) {
      analysis.libraries = $scope.patient.libraries;
      analysis.analysis_biopsy = $scope.patient.analysis_biopsy;
    }
    
    $analysis.add(analysis)
      .then((result) => {
        /*
        $scope.analyses.push(result);
        
        $scope.analyses = _.sortBy($scope.analyses, ['createdAt']);
        $scope.analyses = $scope.analyses.reverse();
        */
        
        $mdDialog.hide({result: result});
      })
      .catch((err) => {
        $mdToast.show($mdToast.simple().textContent('Something went wrong! We were unable to add new biopsy.'));
      });
    
  }

}]);