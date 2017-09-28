app.controller('controller.dashboard.biopsy.board',
['$q', '_', '$scope', 'api.lims', 'api.bioapps', 'api.analysis', 'api.pog', '$mdDialog', '$mdToast', 'analyses',
($q, _, $scope, $lims, $bioapps, $analysis, $pog, $mdDialog, $mdToast, analyses) => {
  
  $scope.pogs = {};
  $scope.searching = false;
  $scope.analyses = analyses;
  $scope.loading = false;
  $scope.showSearch = false;
  $scope.focusSearch = false;
  
  let analysis_query = {
    search: undefined,
    offset: undefined
  };
  
  let refreshAnalyses = () => {
    
    $scope.loading = true;
    
    $analysis.all(analysis_query)
      .then((results) => {
      $scope.loading = false;
        $scope.analyses = results;
      })
      .catch((err) => {
        $scope.loading = false;
        $mdToast.show($mdToast.simple().textContent('Unable to retrieve the requested data.'));
      });
    
  };
  
  $scope.clearSearch = () => {
    $scope.showSearch = false;
    $scope.focusSearch = false;
    
    let filterCache = $scope.filter.search;
    
    $scope.filter.search = null;
    analysis_query.search = undefined;
    if(filterCache !== undefined) refreshAnalyses();
  };
  
  $scope.displaySearch = () => {
    $scope.showSearch = true;
    $scope.focusSearch = true;
  };
  
  
  /**
   * Update search criteria and trigger reload
   */
  $scope.search = () => {
    analysis_query.search = $scope.filter.search;
    refreshAnalyses();
  };
  
  /**
   * Get number of keys in objcet
   * @param {object} obj - Object to return [keys] length
   * @returns {Number}
   */
  $scope.numKeys = (obj) => {
    return Object.keys(obj).length;
  };
  
  
  /**
   * Search LIMS for sources
   */
  $scope.sampleSearch = () => {
    
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
        
        scope.loading = {library: true, illumina: true};
        scope.library = {name: lib};
        scope.illumina = [];
        
        scope.cancel = () => {
          $mdDialog.cancel();
        };
        
        scope.getPoolName = () => {
          let pool = null;
          
          _.forEach(scope.illumina, (r) => {
            if(r.library.indexOf('IX') > -1) pool = r.library;
          });
          
          if(!pool) return "N/A";
          
          return pool;
        };
        
        $lims.library(lib).then(
          (result) => {
            
            if(result.hits === 0) {
              $mdToast.show($mdToast.simple().textContent('Unable to lookup the requested library data in LIMS'));
            }
            
            scope.loading.library = false;
            scope.library = result.results[0];
          })
          .catch((err) => {
            console.log('Err querying library', err);
          });
        
        $lims.illumina_run([lib])
          .then((result) => {
            if(result.hits === 0) {
              $mdToast.show($mdToast.simple().textContent('Illumina run data not available yet'));
            }
            scope.loading.illumina = false;
            scope.illumina = result.results;
          })
          .catch((err) => {
            console.log('Err querying library', err);
          });
        
      }]
    })
    
  };
  
  
  // Open Source Information
  $scope.openAnalysis = (analysis) => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.detail.html',
      controller: ['$scope', (scope) => {
        
        scope.loading = true;
        scope.analysis = analysis;
        scope.sources = [];
        
        scope.cancel = () => {
          $mdDialog.cancel();
        };
        
        $lims.source(analysis.pog.POGID).then(
          (result) => {
            
            let sources = {};
            
            if(result.hits === 0) {
              $mdToast.show($mdToast.simple().textContent('Unable to lookup the requested library'));
              $mdDialog.cancel();
            }
            
            _.forEach(result.results, (s) => {
              sources[s.original_source_name] = s;
            });
            
            scope.sources = _.values(sources);
  
            scope.loading = false;
          })
          .catch((err) => {
            console.log('Err querying library', err);
          });
        
      }]
    })
    
  }
  
  
  // Open Source Information
  $scope.addBiopsy = () => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.add.html',
      controller: ['$scope', (scope) => {
        
        scope.stages = [
          {title: 'Patient', description: 'Meta data about the patient', id: "patient", ordinal: 0},
          {title: 'Details', description: 'Detailed information (optional)', id: "details", ordinal: 1}
        ];
        let activeStage = scope.activeStage = 0;
        
        scope.patient = { POGID: null, clinical_biopsy: 'clinspec_', tracking: true, comparators: false, libraries: {} };
        scope.detail = {};
        scope.source_loading = false;
        scope.show_sources = false;
        scope.searchPogcache = null;
        
        scope.find_libraries = false;
        scope.found_libraries = [];
        scope.libraries_loading = false;
  
        scope.events = {
          valid: false,
          dirty: true,
          pristine: true,
        };
        
        scope.$watch('patient.tracking', (newVal, oldVal) => {
          
          if(newVal === false && oldVal === true) {
            scope.patient.analysis_biopsy = 'biop';
          } else {
            scope.patient.analysis_biopsy = null;
          }
        });
        
        // Close Dialog
        scope.cancel = () => { $mdDialog.cancel(); };
        
        // Search Users with auto complete
        scope.searchPOGs = (searchText) => {
    
          return $q((resolve, reject) => {
            if(searchText.length === 0) return [];
      
            $pog.all({query: searchText, all: true}).then(
              (resp) => { resolve(resp); },
              (err) => { console.log(err); reject(); }
            );
          });
        };
  
        // Search Users with auto complete
        scope.searchDisease = (searchText) => {
    
          return $q((resolve, reject) => {
            if(searchText.length === 0) return [];
      
            $lims.diseaseOntology(searchText).then(
              (resp) => { resolve(resp.results); },
              (err) => { console.log(err); reject(); }
            );
          });
        };
  
        // Search Users with auto complete
        scope.searchGroups = (searchText) => {
    
          return $q((resolve, reject) => {
            if(searchText.length === 0) return [];
      
            $bioapps.cancer_goup(searchText).then(
              (resp) => { resolve(resp.results); },
              (err) => { console.log(err); reject(); }
            );
          });
        };

        // Find LIMS Sources
        scope.limsSources = () => {
          
          // Check to see if this is the same value
          if(scope.searchPogcache === scope.searchQuery || scope.searchQuery.length === 0) return; // Same value, btfo!
          
          console.log('Searching', scope.searchQuery);
          
          scope.source_loading = true;
          scope.show_sources = true;
          scope.pog_sources = [];
          
          // Find LIMS sources for this POGID
          $lims.source(scope.searchQuery)
            .then((result) => {
              let sources = {};
              
              _.forEach(result.results, (s) => {
                sources[s.original_source_name] = s;
              });
  
              scope.source_loading = false;
              scope.pog_sources = _.values(sources);
              scope.searchPogcache = scope.searchQuery;
            })
            .catch((err) => {
              console.log('Failed to lookup POG sources');
            });
        };
  
        // Move back a stage
        scope.lastStage = () => {
          scope.activeStage--;
        };
        
        // Move forward a stage
        scope.nextStage = () => {
          let form;
          // Try to trigger submit...
          switch (scope.activeStage) {
            case 1:
              form = scope.referenceForm;
              break;
            case 0:
              form = scope.matching;
              break;
          }
  
          form.$setSubmitted();
          if (form.$valid) {
            scope.activeStage++;
          }
        };
        
        // Attempt to guess library names
        scope.libraryGuess = () => {
          
          scope.find_libraries = true;
          scope.libraries_loading = true;
          
          let diseaseLibraries = [];
          let pogs = {};
          
          let pogid = (scope.patient.POGID) ? scope.patient.POGID.POGID : scope.searchQuery;
          
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
                
                scope.found_libraries.push({collection_date: date, normal: normal, tumour: tumour, transcriptome: transcriptome});
                
              });
              
              scope.libraries_loading = false;
              
            })
            .catch((err) => {
              console.log('failed to find/guess libraries', err);
  
              scope.libraries_loading = false;
            });
        
        };
  
        /**
         * Select collection and auto-populate
         *
         * @param collection
         */
        scope.selectCollection = (collection) => {
          
          console.log('Collection', collection);
          
          scope.patient.libraries.normal = collection.normal.name;
          scope.patient.libraries.tumour = collection.tumour.name;
          scope.patient.libraries.transcriptome = collection.transcriptome.name;
        };
        
        // Submit Biopsy Entry
        scope.submit = (f) => {
          
          // Setup submission object
          let analysis = {
            POGID: (scope.patient.POGID) ? scope.patient.POGID.POGID : scope.searchQuery,
            clinical_biopsy: scope.patient.clinical_biopsy,
            disease: scope.patient.disease,
            biopsy_notes: scope.patient.biopsy_notes,
            tracking: scope.patient.tracking,
            notes: scope.patient.notes,
            libraries: null
          };
          
          // Add libraries and biop if not tracking
          if(!scope.patient.tracking) {
            analysis.libraries = scope.patient.libraries;
            analysis.analysis_biopsy = scope.patient.analysis_biopsy;
          }
          
          $analysis.add(analysis)
            .then((result) => {
              $scope.analyses.push(result);
              
              $scope.analyses = _.sortBy($scope.analyses, ['createdAt']);
              $scope.analyses = $scope.analyses.reverse();
              
              $mdDialog.hide();
            })
            .catch((err) => {
              $mdToast.show($mdToast.simple().textContent('Something went wrong! We were unable to add new biopsy.'));
            });
          
        }
        
      }]
    })
    
  }
  

}]);