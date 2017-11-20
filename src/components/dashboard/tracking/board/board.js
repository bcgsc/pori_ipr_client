app.controller('controller.dashboard.tracking.board',
['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', '$interval', '$mdDialog', '$mdToast', '$userSettings', 'states', 'definitions', 'myDefinitions', 'api.socket',
($q, _, $scope, $definition, $state, $task, $interval, $mdDialog, $mdToast, $userSettings, states, definitions, myDefinitions, socket) => {

  $scope.allDefinitions = definitions; // All definitions for picking from
  $scope.definitions = myDefinitions; // Definitions set by user
  $scope.sortedStates = {};
  $scope.filter = {
    hidden: false,
    state: ($userSettings.get('tracking.state')) ? $userSettings.get('tracking.state') : {status: ['active', 'pending', 'hold', 'failed']},
    definition: ($userSettings.get('tracking.definition')) ? $userSettings.get('tracking.definition') : {slug: ['projects', 'sequencing', 'bioapps'], hidden: false},
  };
  $scope.refreshing = false;
  $scope.tracking_loading = false;
  
  socket.on('taskStatusChange', (task) => {

    let s = _.findKey($scope.sortedStates[task.state.slug], (s) => {
      return (s.ident === task.state.ident);
    });

    let t = _.findKey($scope.sortedStates[task.state.slug][s].tasks, (t) => {
      return (t.ident === task.ident);
    });

    $scope.sortedStates[task.state.slug][s].tasks[t] = task;

  });

  // Sort States
  let sortStates = (statesInput) => {

    $scope.sortedStates = {};

    _.forEach(statesInput, (s) => {
      if(!$scope.sortedStates[s.slug]) $scope.sortedStates[s.slug] = [];
      $scope.sortedStates[s.slug].push(s);
    });

  };
  
  $scope.toggleDefFilter = (def) => {
    if($scope.filter.definition.slug.indexOf(def.slug) > -1) {
      $scope.filter.definition.slug.splice($scope.filter.definition.slug.indexOf(def.slug), 1);
    }else {
      $scope.filter.definition.slug.push(def.slug);
    }
  };

  $scope.searchPogs = (definition, query) => {

    return (state) => {
      if (!query) query = "";

      // Define Return result
      let result = false;

      // Run over each split by space
      _.forEach(query.split(' '), (q) => {

        if (q.length === 0) return result = true;

        // Pog ID?
        if (state.analysis.pog.POGID.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

      });

      return result;

    };
  };
  
  // When the options panel closes, refresh the cases
  $scope.$watch('showOptions', (newVal, oldVal) => {
    if(oldVal === true && newVal === false) $scope.refreshList();
  });
  
  
  /**
   * Reload tracking data from API
   *
   * @param {boolean} ninja - If true, do the update transparently
   */
  $scope.refreshList = (ninja=false) => {
    let opts = {
      hidden: $scope.filter.hidden,
      slug: _.join($scope.filter.definition.slug, ',')
    };
    
    if(!ninja) $scope.refreshing = true;
    $scope.tracking_loading = true;
    
    $definition.all(opts).then(
      (result) => {
        $scope.definitions = result;
        
        if(!ninja) $userSettings.save('tracking.definition', $scope.filter.definition);
        
        $state.all({status: _.join($scope.filter.state.status, ','), slug: _.join($scope.filter.definition.slug, ',')})
          .then((result) => {
            sortStates(result);
            $scope.refreshing = false;
            $scope.tracking_loading = false;
  
            if(!ninja) $userSettings.save('tracking.state', $scope.filter.state);
            
          })
          .catch((err) => {
            console.log('Failed to get updated tracking data: ', err);
            $mdToast.showSimple('Unable to get latest tracking data');
          });
        
      },
      (err) => {
        console.log('Failed to get updated definitions', err);
      }
    )

  };

  // Open modal for new tracking
  $scope.trackNewPOG = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/tracking/board/board.new.html',
      controller: ['$q', 'scope', 'api.lims', 'api.pog', 'api.tracking', ($q, scope, $lims, $pog, $tracking) => {


        scope.cancel = () => {
          $mdDialog.cancel();
        };

        scope.submit = (f) => {
          // Check Validation
          console.log('Check validation of form', f);

          if(scope.track.POGID === undefined || scope.track.POGID === null) scope.track.POGID = scope.searchQuery;
          if(typeof scope.track.POGID === 'object') scope.track.POGID = scope.track.POGID.POGID;

          if(typeof scope.track.disease === 'object') scope.track.disease = scope.track.disease.text;

          // Submit data to API
          $tracking.init(scope.track).then(
            (result) => {

              // Add new states to array
              $mdDialog.hide({states: result});

            },
            (err) => {
              console.log('Failed to init tracking', err);
            }
          )

        };

        // Search Users with auto complete
        scope.searchDisease = (searchText) => {

          return $q((resolve, reject) => {
            if(searchText.length === 0) return [];

            $lims.diseaseOntology(searchText).then(
              (resp) => {

                resolve(resp.results);
              },
              (err) => {
                console.log(err);
                reject();
              }
            );
          });
        };

        // Search Users with auto complete
        scope.searchPOGs = (searchText) => {

          return $q((resolve, reject) => {
            if(searchText.length === 0) return [];

            $pog.all({query: searchText, all: true}).then(
              (resp) => {

                resolve(resp);
              },
              (err) => {
                console.log(err);
                reject();
              }
            );
          });
        };


      }]
    })
      // Modal closed
      .then(
        // Successfully
        (result) => {

          // Take result, merge with existing and sort
          states = states.concat(result.states);
          sortStates(states);

          $mdToast.show($mdToast.simple().textContent('Tracking successfully initialized.'));
        },
        // Canceled
        () => {
          $mdToast.show($mdToast.simple().textContent('No tracking initialized.'));
        }
      )

  };

  sortStates(states);
  
  // Start polling states for updates
  $interval(() => {
    $scope.refreshList(true);
  }, 30000);

}]);