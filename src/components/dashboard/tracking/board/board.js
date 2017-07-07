app.controller('controller.dashboard.tracking.board',
['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', '$mdDialog', '$mdToast', 'states', 'definitions',
($q, _, $scope, $definition, $state, $task, $mdDialog, $mdToast, states, definitions) => {

  $scope.definitions = definitions;
  $scope.sortedStates = {};
  $scope.filter = {
    hidden: false
  };

  // Sort States

  let sortStates = (statsInput) => {

    $scope.sortedStates = {};

    _.forEach(statsInput, (s) => {

      if(!$scope.sortedStates[s.slug]) $scope.sortedStates[s.slug] = [];

      $scope.sortedStates[s.slug].push(s);

    });

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


  // Refresh Definitions
  $scope.refreshList = () => {

    let opts = {
      params: {
        hidden: $scope.filter.hidden
      }
    };

    console.log('Options', opts);

    $definition.all(opts).then(
      (result) => {
        $scope.definitions = result;
        sortStates(states);
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

}]);