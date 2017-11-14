app.controller('controller.dashboard.tracking.lane',
['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', 'api.socket', '$mdDialog', '$mdToast', 'lane', 'states',
($q, _, $scope, $definition, $state, $task, $socket, $mdDialog, $mdToast, lane, states) => {
  
  $scope.lane = lane;
  $scope.states = states;
  $scope.cols = [];
  
  // Create Task Columns
  _.forEach(states, (s) => {
    _.forEach(s.tasks, (t) => {
      if(!_.find($scope.cols, {slug: t.slug})) {
        $scope.cols.push(t);
      }
    });
  });
  
  $scope.cols = _.orderBy($scope.cols, 'ordinal');
  $scope.getStateTask = (state, col) => {
    
    let search = _.find(state.tasks, {slug: col.slug});
    
    if(!search) return null;
    
    return search;
    
  };
  
  /**
   * Open Task check-in editor
   *
   * @param {object} state - State object
   * @param {object} task - Task object
   */
  $scope.editValue = (state, task) => {
    
    $mdDialog.show({
      controller: 'controller.dashboard.tracking.lane.checkin',
      templateUrl: 'dashboard/tracking/board/board.lane.checkin.html',
      locals: {
        task: task,
        state: state
      }
    })
      .then((result) => {
        if(result.state) {
          let i = _.findIndex(states, {ident: result.state.ident});
          if(i) $scope.states[i] = states[i] = result.state;
        }
      })
      .catch((err) => {
        $mdToast.showSimple('No changes where saved.');
      })
    
  };
  
}]);