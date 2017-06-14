app.controller('controller.ipr-tracking-card.task',
['_', '$scope', '$mdDialog', '$mdToast', 'api.tracking.task', 'api.tracking.state', 'pog', 'state', 'task',
(_, $scope, $mdDialog, $mdToast, $task, $state, pog, state, task) => {

  $scope.pog = pog;
  $scope.state = state;
  $scope.task = task;
  $scope.addCheckin = false;

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

  $scope.removeCheckin = (datestamp) => {

    $task.revokeCheckin($scope.task.ident, datestamp).then(
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

}]);
