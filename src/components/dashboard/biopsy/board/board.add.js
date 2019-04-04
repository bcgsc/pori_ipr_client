app.controller('controller.dashboard.biopsy.board.add',
  ['$scope', '_', 'api.lims', 'api.bioapps', 'api.analysis', 'api.pog', 'api.project', '$mdDialog', '$mdToast', '$filter', 'projects', '$http', '$async',
    ($scope, _, $lims, $bioapps, $analysis, $pog, $project, $mdDialog, $mdToast, $filter, projects, $http, $async) => {
      $scope.stages = [
        {
          title: 'Patient',
          description: 'Meta data about the patient',
          id: 'patient',
          ordinal: 0,
        },
        {
          title: 'Details',
          description: 'Detailed information (optional)',
          id: 'details',
          ordinal: 1,
        },
      ];

      $scope.activeStage = 0;
  
      $scope.patient = {
        POGID: null,
        clinical_biopsy: 'clinspec_',
        tracking: true,
        comparators: false,
        libraries: {},
      };
      $scope.projects = projects;
      $scope.detail = {};
      $scope.source_loading = false;
      $scope.show_sources = false;
      $scope.searchPogcache = null;
  
      $scope.find_libraries = false;
      $scope.found_libraries = [];
      $scope.libraries_loading = false;
      $scope.physicians = [0];
  
      $scope.addPhysician = () => { $scope.physicians.push($scope.physicians.length); };
      $scope.removePhysician = (i) => { $scope.physicians.splice(i, 1); };
  
      let threeLetterCodes = [];

      $http.get('../assets/json/threeLetterCodes.json')
        .then((result) => {
          threeLetterCodes = _.sortBy(result.data, ['code']);
        });
  
      // set analysis biopsy field if tracking is disabled
      $scope.$watch('patient.tracking', (newVal, oldVal) => {
        if (newVal === false && oldVal === true) {
          $scope.patient.analysis_biopsy = 'biop';
        } else {
          $scope.patient.analysis_biopsy = null;
        }
      });

      // convert POG ID field to uppercase
      $scope.$watch('searchQuery', (val) => {
        $scope.searchQuery = $filter('uppercase')(val);
      }, true);

      // convert Pediatric ID field to uppercase
      $scope.$watch('patient.pediatric_id', (val) => {
        $scope.patient.pediatric_id = $filter('uppercase')(val);
      }, true);

      // convert Cancer Group (3 Letter Code) field to uppercase
      $scope.$watch('cancerGroupQuery', (val) => {
        $scope.cancerGroupQuery = $filter('uppercase')(val);
      }, true);
  
      // Close Dialog
      $scope.cancel = () => { $mdDialog.cancel(); };
  
      // Search patients with auto complete
      $scope.searchPOGs = async (searchText) => {
        if (searchText.length === 0) return [];
        try {
          const pogs = await $pog.all({ query: searchText, all: true });
          return pogs;
        } catch (err) {
          $mdToast.showSimple(`An error occurred while searching for patients: ${err}`);
          return [];
        }
      };
  
      // Search Disease Endpoint
      $scope.searchDisease = async (searchText) => {
        if (searchText.length === 0) return [];
        try {
          const diseases = await $lims.diseaseOntology(searchText);
          return diseases.results;
        } catch (err) {
          $mdToast.showSimple(`An error occurred while searching for diseases: ${err}`);
          return [];
        }
      };
  
      // Search Three Letter Code with auto complete
      $scope.searchGroups = (searchText) => {
        return _.filter(threeLetterCodes, (e) => {
          let code;
          if (e.code.includes(searchText.toUpperCase())) code = e;
          return code;
        });
      };

      // Performing checks on POG change
      $scope.checkPOG = $async(async () => {
        // find LIMS sources for POG
        $scope.limsSources();

        // Check to see if this is the same value
        if ($scope.searchQuery.length === 0) return; // Same value, btfo!

        // check if POG already exists in DB
        const pogid = ($scope.patient.POGID) ? $scope.patient.POGID.POGID : $scope.searchQuery;

        try {
          const pogs = await $pog.id(pogid);

          $scope.patient.projects = pogs.projects;
          $scope.patient.age_of_consent = pogs.age_of_consent;
          $scope.patient.alternate_identifier = pogs.alternate_identifier;
          $scope.existingPOG = true;
        } catch (err) {
          if (err.status === 404) {
            // POG not already in IPR - can set projects field
            $scope.patient.projects = [_.find($scope.projects, { name: 'POG' })];
            $scope.patient.age_of_consent = null;
            $scope.patient.alternate_identifier = null;
            $scope.existingPOG = false;
          }
        }
      });
  
      // Find LIMS Sources
      $scope.limsSources = $async(async () => {
        // Check to see if this is the same value
        if ($scope.searchPogcache === $scope.searchQuery || $scope.searchQuery.length === 0) return; // Same value, btfo!
    
        $scope.source_loading = true;
        $scope.show_sources = true;
        $scope.pog_sources = [];

        try {
          const limsSources = await $lims.source($scope.searchQuery);

          const sources = {};
        
          _.forEach(limsSources.results, (s) => {
            sources[s.original_source_name] = s;
          });
      
          $scope.source_loading = false;
          $scope.pog_sources = _.values(sources);
          $scope.searchPogcache = $scope.searchQuery;
        } catch (err) {
          $mdToast.showSimple(`An error occurred while retrieving sources from LIMS: ${err}`);
        }
      });
  
      // Attempt to guess library names
      $scope.libraryGuess = $async(async () => {
        $scope.find_libraries = true;
        $scope.libraries_loading = true;
    
        const diseaseLibraries = [];
        const pogs = {};
    
        let pogid = ($scope.patient.POGID) ? $scope.patient.POGID.POGID : $scope.searchQuery;

        try {
          const limsSamples = await $lims.sample([pogid]);

          _.forEach(limsSamples.results, (sample) => {
            pogid = sample.participant_study_id;
            const datestamp = sample.sample_collection_time.substring(0, 10);
        
            const library = {
              name: sample.library,
              type: (sample.disease_status === 'Normal') ? 'normal' : null,
              source: sample.original_source_name,
              disease: sample.disease,
              sample_collection_time: sample.sample_collection_time,
            };
        
            if (sample.disease_status === 'Diseased' && !diseaseLibraries.includes(sample.library)) {
              diseaseLibraries.push(sample.library);
            }
        
            // Check if pog has been seen yet in this cycle
            if (!pogs[pogid]) pogs[pogid] = {};
        
            // Check if this biopsy event date
            if (!pogs[pogid][datestamp]) pogs[pogid][datestamp] = [];
        
            // Has this library name been listed yet?
            if (!_.find(pogs[pogid][datestamp], { name: library.name })) {
              pogs[pogid][datestamp].push(library);
            }
          });

          const limsLibraries = await $lims.library(diseaseLibraries);

          // Loop over found libraries
          _.forEach(limsLibraries.results, (library) => {
            // Grab associated POG biopsies
            const pog = pogs[library.full_name.split('-')[0]];

            // Loop over biopsies
            _.forEach(pog, (libraries, biopsyDate) => {
              // The index key of the library we're looking for
              const i = _.findKey(libraries, { name: library.name });

              // If the index is valid, store the updated data
              if (i) {
                // Types of library strategy mappings
                if (library.library_strategy === 'WGS') pogs[library.full_name.split('-')[0]][biopsyDate][i].type = 'tumour';
                if (library.library_strategy.includes('RNA')) pogs[library.full_name.split('-')[0]][biopsyDate][i].type = 'transcriptome';
              }
            });
          });

          // Did we find anything?
          if (!pogs[pogid]) throw new Error('No libraries found');

          const pogLibs = pogs[pogid];
      
          // Organize into object
          _.forEach(pogLibs, (libs, date) => {
            const normal = _.find(libs, { type: 'normal' });
            const tumour = _.find(libs, { type: 'tumour' });
            const transcriptome = _.find(libs, { type: 'transcriptome' });
        
            $scope.found_libraries.push({
              collection_date: date, normal: normal, tumour: tumour, transcriptome: transcriptome,
            });
          });
      
          $scope.libraries_loading = false;
        } catch (err) {
          $scope.libraries_loading = false;
        }
      });
  
      /**
       * Select collection and auto-populate
       *
       * @param {Object} collection - set of normal, tumour, and transcriptome libraries that can be used to autopopulate
       *
       * @returns {undefined}
       */
      $scope.selectCollection = (collection) => {
        $scope.patient.libraries.normal = collection.normal.name;
        $scope.patient.libraries.tumour = collection.tumour.name;
        $scope.patient.libraries.transcriptome = collection.transcriptome.name;
      };

      /**
       * Bind POG to project
       *
       * @param {Object} bindPog - POGs model object to bind to projects
       * @param {Object[]} bindProjects - list of project model objects to bind POG to
       *
       * @returns {undefined}
       */
      const addPOG = (bindPog, bindProjects) => {
        _.each(bindProjects, (project) => {
          // Check if project already contains POG
          if (_.find(project.pogs, { ident: bindPog.ident })) {
            alert('This sample has already been added to the project');
          } else {
            // Add pog to project
            $project.pog(project.ident).add(bindPog.ident)
              .then(() => {
                // refresh project list
                $scope.projects = $project.all();
              })
              .catch((err) => {
                $mdToast.showSimple(`There was an error binding the patient and projects: ${err}`);
              });
          }
        });
      };
  
      // Submit Biopsy Entry
      $scope.submit = () => {
        $scope.sending = true;

        // Touch required fields to invoke validation
        _.each($scope.PatientForm.$error.required, (field) => {
          field.$setTouched();
        });

        // Check if form is valid
        if (!$scope.PatientForm.$valid) {
          $scope.sending = false;
          return; // don't submit invalid form
        }
    
        // Setup submission object
        const analysis = {
          POGID: ($scope.patient.POGID) ? $scope.patient.POGID.POGID : $scope.searchQuery,
          clinical_biopsy: $scope.patient.clinical_biopsy,
          disease: (typeof $scope.patient.disease === 'object') ? $scope.patient.disease.text : $scope.patient.disease,
          threeLetterCode: (typeof $scope.patient.threeLetterCode === 'object') ? $scope.patient.threeLetterCode.code : $scope.patient.threeLetterCode,
          biopsy_notes: $scope.patient.biopsy_notes,
          biopsy_date: $scope.patient.biopsy_date,
          tracking: $scope.patient.tracking,
          notes: $scope.patient.notes,
          pediatric_id: $scope.patient.pediatric_id,
          physician: [],
          libraries: null,
          alternate_identifier: $scope.patient.alternate_identifier,
          age_of_consent: $scope.patient.age_of_consent,
        };

        _.forEach($scope.patient.physician, (p) => { analysis.physician.push(p); });
    
        // Add libraries and biop if not tracking
        if (!$scope.patient.tracking) {
          analysis.libraries = $scope.patient.libraries;
          analysis.analysis_biopsy = $scope.patient.analysis_biopsy;
        }
    
        $analysis.add(analysis)
          .then((result) => {
            // analysis successfully created, bind to projects if this is a new POG
            if (!$scope.existingPOG) addPOG(result.pog, $scope.patient.projects);
            result.pog.projects = $scope.patient.projects;

            $scope.sending = false;
            $mdDialog.hide({ result: result });
          })
          .catch((err) => {
            $scope.sending = false;
            $mdToast.showSimple(`An error occurred and the new biopsy was not added: ${err}`);
          });
      };
    }]);
