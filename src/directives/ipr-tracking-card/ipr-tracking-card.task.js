app.controller('controller.ipr-tracking-card.task',
['_', '$scope', '$q', '$mdDialog', '$mdToast', 'api.tracking.task', 'api.tracking.state', 'api.user', 'pog', 'state', 'task',
(_, $scope, $q, $mdDialog, $mdToast, $task, $state, $user, pog, state, task) => {

  $scope.pog = pog;
  $scope.state = state;
  $scope.task = task;
  $scope.addCheckin = false;
  $scope.assign = {user: null};
  $scope.showAssignUser = false;

  $scope.cancel = () => {
    $mdDialog.hide({task: $scope.task, state: state});
  };

  $scope.toggleCheckIn = () => {
    $scope.addCheckin = !$scope.addCheckin;
  };

  $scope.$watch('task.outcome', (newVal, oldVal) => {
    if($scope.addCheckin) $scope.addCheckin = false;
  });

  $scope.updateStatus = (status) => {

    // Update the task's state
    let updateTask = angular.copy($scope.task);

    updateTask.status = status;

    $task.update(updateTask).then(
      (result) => {
        $scope.task = result;
      },
      (err) => {
        console.log('Failed to update task', err);
      }
    )

  };

  $scope.removeCheckin = (checkin) => {

    $task.revokeCheckin(task.ident, checkin.ident).then(
      (result) => {
        // Remove date stamp
        $scope.task = task = result;
      }
    )

  };

  $scope.states = [
    'pending',
    'active',
    'hold',
    'complete',
    'failed'
  ];

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

  $scope.assignUser = () => {

    $task.assignUser(task.ident, $scope.assign.user.ident).then(
      (result) => {
        $scope.task = task = result;
        $scope.showAssignUser = false;
      },
      (err) => {
        console.log('Failed to assign user', err);
      }
    )

  }


}]);
