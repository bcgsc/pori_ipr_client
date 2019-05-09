app.controller('controller.dashboard.biopsy.board',
['$q', '_', '$scope', 'api.lims', 'api.analysis', 'api.pog', '$mdDialog', '$mdToast', 'analyses', 'comparators', 'projects', '$async',
($q, _, $scope, $lims, $analysis, $pog, $mdDialog, $mdToast, analyses, comparators, projects, $async) => {
  
  $scope.pogs = {};
  $scope.searching = false;
  $scope.analyses = analyses.analysis;
  $scope.loading = false;
  $scope.showSearch = false;
  $scope.focusSearch = false;
  $scope.active_sheet = 'biopsy';
  
  let analysis_query = {
    search: undefined,
    paginated: true
  };
  
  $scope.paginate = {
    offset: 0,
    limit: 25,
    total: analyses.total
  };
  
  $scope.refreshAnalyses = () => {
    
    $scope.loading = true;
    
    analysis_query.limit = $scope.paginate.limit;
    analysis_query.offset = $scope.paginate.offset;
    
    $analysis.all(analysis_query)
      .then((results) => {
        $scope.loading = false;
        $scope.analyses = results.analysis;
        $scope.paginate.total = results.total;
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
    if(filterCache !== undefined) $scope.refreshAnalyses();
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
    $scope.paginate.offset = 0; // start from first page of paginator if performing search
    $scope.refreshAnalyses();
  };
  
  /**
   * Get number of keys in objcet
   * @param {object} obj - Object to return [keys] length
   * @returns {Number}
   */
  $scope.numKeys = (obj) => {
    return Object.keys(obj).length;
  };
  
  $scope.openLibrary = (lib) => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.library.html',
      controller: ['$scope', $async(async (scope) => {
        
        scope.loading = {library: true, illumina: true};
        scope.library = {name: lib};
        scope.illumina = [];
        
        scope.cancel = () => {
          $mdDialog.cancel();
        };

        try { 
          const libs = await $lims.libraries(lib, 'uri');
          if (libs.meta.total === 0) {
            return $mdToast.show($mdToast.simple(
              'Libary data is not yet available in LIMS.',
            ).hideDelay(5000));
          }
          const bioMetadata = await $lims.biologicalMetadata(
            libs.results[0].originalSourceName, 'originalSourceName',
          );

          if (bioMetadata.meta.total === 0) {
            return $mdToast.show($mdToast.simple(
              'Libary data is not yet available in LIMS.',
            ).hideDelay(5000));
          }
          
          scope.loading.library = false;
          scope.library = libs.results[0];
          
          const seqRuns = await $lims.sequencerRuns([lib]);
          if (seqRuns.meta.total === 0) {
            return $mdToast.show($mdToast.simple(
              'Illumina run data not available yet',
            ).hideDelay(5000));
          }
          scope.illumina = seqRuns.results;
          scope.poolName = '';
          
          scope.illumina.forEach((r) => {
            if (r.libraryName.includes('IX')) {
              scope.poolName = r.libraryName;
            }
          });
          
          if (!scope.poolName) {
            scope.poolName = 'N/A';
          }
          scope.loading.illumina = false;
        } catch (err) {
          $mdToast.show($mdToast.simple(
            'Libary data is not yet available in LIMS.',
          ).hideDelay(5000));
        } finally {
          scope.loading.library = false;
          scope.loading.illumina = false;
          $scope.$digest();
        }
      })]
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
        scope.projects = _.map(_.sortBy(analysis.pog.projects, 'name'), 'name').join(', ');
        
        scope.cancel = () => {
          $mdDialog.cancel();
        };
        
        $lims.biologicalMetadata(analysis.pog.POGID).then(
          (result) => {
            
            let sources = {};
            
            if (result.meta.count === 0) {
              $mdToast.show($mdToast.simple().textContent('Unable to lookup the requested library'));
            }
            
            _.forEach(result.results, (s) => {
              sources[s.originalSourceName] = s;
            });
            
            scope.sources = _.values(sources);
  
            scope.loading = false;
          })
          .catch((err) => {
            console.log('Err querying library', err);
          });
        
      }]
    })
    
  };
  
  // Open Source Information
  $scope.editAnalysis = (analysis) => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.edit.html',
      controller: 'controller.dashboard.biopsy.board.edit',
      locals: {
        analysis: analysis,
        projects: projects
      }
    })
      .then((result) => {
        // update result row and update projects, alt id, and age of consent for analyses under same POG
        _.each($scope.analyses, function(a, i) {
          if(result.analysis.ident == a.ident) {
            $scope.analyses[i] = result.analysis; // updating result row
          } else if(result.analysis.pog_id == a.pog_id) {
            $scope.analyses[i].pog.projects = result.analysis.pog.projects; // updating projects of rows w/ same POG
            $scope.analyses[i].pog.alternate_identifier = result.analysis.pog.alternate_identifier; // updating alternate identifier of rows w/ same POG
            $scope.analyses[i].pog.age_of_consent = result.analysis.pog.age_of_consent; // updating age of consent of rows w/ same POG
          }
        })
      
      });
    
  };
  
  // Open Source Information
  $scope.editComparators = (analysis) => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.edit_comparator.html',
      controller: 'controller.dashboard.biopsy.board.edit_comparator',
      locals: {
        analysis: analysis,
        comparators: comparators
      }
    })
      .then((result) => {
        // Find result, and update row
        let i = _.findIndex($scope.analyses, {ident: result.ident});
        if(i) $scope.analyses[i] = result;
      
      });
    
  };
  
  
  // Open Source Information
  $scope.addBiopsy = () => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/biopsy/board/board.add.html',
      controller: 'controller.dashboard.biopsy.board.add',
      locals: {
        projects: projects
      }
    })
      .then((result) => {
        if(result.result) $scope.analyses.unshift(result.result);
      });
    
  }
  

}]);