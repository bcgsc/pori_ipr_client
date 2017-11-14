app.controller('controller.dashboard.tracking.lane.checkin',
['_', '$scope', '$q', '$mdDialog', '$mdToast', 'moment', 'api.tracking.state', 'api.tracking.task', 'api.user', 'api.jira', 'state', 'task',
(_, $scope, $q, $mdDialog, $mdToast, $moment, $state, $task, $user, $jira, state, task) => {
  
  $scope.state = state;
  $scope.task = task;
  $scope.checkin = {outcome: null};
  $scope.states = [
    'pending',
    'active',
    'complete',
    'hold',
    'failed',
    'cancelled'
  ];
  
  $scope.date = moment().toISOString();
  
  /**
   * Update status for task
   * @param {string} status
   */
  $scope.updateStatus = (status) => {
    
    // Update the task's state
    let updateTask = angular.copy($scope.task);
    
    updateTask.status = status;
    
    $task.update(updateTask).then(
      (result) => {
        $scope.task = task = result;
        
        // Update state
        updateStateTask(task);
      },
      (err) => {
        console.log('Failed to update task', err);
      }
    )
    
  };
  
  $scope.cancel = () => {
    $mdDialog.cancel({state: $scope.state});
  };
  
  $scope.close = () => {
    $mdDialog.hide({state: $scope.state});
  };
  
  /**
   * Update the task definition in state.tasks[]
   * @param task
   */
  let updateStateTask = (task) => {
    // Find and update task row in state
    let i = _.findIndex(state.tasks, {ident: task.ident});
    $scope.state.tasks[i] = state.tasks[i] = $scope.task;
  };
  
  /**
   * Revoke a check-in
   *
   * @param {object} checkin
   */
  $scope.revokeCheckin = (checkin) => {
    $task.revokeCheckin(task.ident, checkin.ident)
      .then((result) => {
        let i = _.findIndex($scope.task.checkins, {ident: checkin.ident});
  
        task.checkins.splice(i, 1);
        $scope.task = task;
        
        // Update in state
        updateStateTask(task);
        
        $mdToast.showSimple('Task check-in has been revoked.');
      })
      .catch((err) => {
        $mdToast.showSimple('Unable to remove the task check-in.');
      });
  };
  
  /**
   * Add new Checkin
   *
   */
  $scope.checkin = () => {
    
    // If date, reformat
    if(task.outcomeType === 'date') {
      $scope.checkin.outcome = moment($scope.checkin.outcome).toISOString();
    }
    
    // Building check-in body
    $task.checkInTaskIdent(task.ident, $scope.checkin.outcome).then(
      (result) => {
        $scope.task = task = result;
        
        // Update in state
        updateStateTask(task);
        
      },
      (err) => {
        
        let message = "";
        message += "Failed to perform checkin.";
        
        if(err.data.error && err.data.error.cause && err.data.error.cause.error && err.data.error.cause.error.message) {
          message += " Reason: " + err.data.error.cause.error.message;
        }
        
        $mdToast.showSimple(message);
      }
    )
    
  }
  
}]);
