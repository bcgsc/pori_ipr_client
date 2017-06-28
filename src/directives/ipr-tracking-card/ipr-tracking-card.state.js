app.controller('controller.ipr-tracking-card.state',
['_', '$scope', '$q', '$mdDialog', '$mdToast', 'api.tracking.state', 'api.user', 'api.jira', 'pog', 'state',
(_, $scope, $q, $mdDialog, $mdToast, $state, $user, $jira, pog, state) => {

  $scope.pog = pog;
  $scope.state = state;
  $scope.states = [
    'active',
    'pending',
    'complete',
    'hold',
    'failed'
  ];

  $scope.cancel = () => {
    $mdDialog.hide({state: $scope.state});
  };

  $scope.updateStatus = (status) => {

    // Update the task's state
    let updateState = angular.copy($scope.state);
    updateState.status = status;

    $state.update(state.ident, updateState).then(
      (result) => {
        $scope.state = result;
      },
      (err) => {
        console.log('Failed to update task', err);
      }
    )
  };

  // Update State
  $scope.save = (f) => {

  };

  // Search Users with auto complete
  $scope.searchUsers = (searchText) => {
    let deferred = $q.defer();

    if(searchText.length === 0) return [];

    $user.search(searchText).then(
      (resp) => {
        deferred.resolve(resp);
      },
      (err) => {
        console.log(err);
        deferred.reject();
      }
    );

    return deferred.promise;
  };

}]);
