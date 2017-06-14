app.directive("iprTrackingCard", ['$q', '_', '$mdDialog', '$mdToast', '$state', '$timeout', ($q, _, $mdDialog, $mdToast, $state, $timeout) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      state: '=state'
    },
    templateUrl: 'ipr-tracking-card/ipr-tracking-card.html',
    link: (scope, element, attr) => {

      let pog = scope.pog = scope.state.analysis.pog;
      let analysis = scope.analysis = scope.state.analysis;
      let state = scope.state;
      
      // Sort Tasks by ordinal
      scope.state.tasks = state.tasks =_.sortBy(scope.state.tasks, 'ordinal');
      scope.error = false; // Default error state
      scope.priority = new Array(analysis.priority);

      // Check if there are any failed tasks
      let checkStates = () => {
        scope.error = (_.find(scope.state.tasks, {status: 'failed'})) ? true : false;
        scope.hold =  (_.find(scope.state.tasks, {status: 'hold'})) ? true : false;
      };

      // Mouse hover
      scope.openUserWindow = (assignee) => {
        assignee.mouseLeft = false;
        $timeout(() => {
          if(!assignee.mouseLeft) assignee.show = true;
        }, 300)
      };

      scope.closeUserWindow = (assignee) => {
        assignee.mouseLeft = true;

        $timeout(() => {
          if(!assignee.keepOpen) assignee.show = false;
        }, 300)
      };

      scope.keepUserWindow = (assignee) => {
        assignee.keepOpen = true;
      };

      scope.unKeepUserWindow = (assignee) => {
        assignee.keepOpen=false;
        assignee.show = false;
      };

      scope.getTaskStateCount = (state) => {
        let count = 0;

        _.forEach(scope.state.tasks, (t) => {
          if(t.status === state) count++;
        });

        return count;
      };

      scope.getFirstOutcome = (task) => {
        let first = "";
        let k = 0;
        _.forEach(task.outcome, (o, i) => {
          if(k===0) first = o;
          k++;
        });
        return first.value;
      };

      scope.numKeys = (o) => {
        return Object.keys(o).length;
      };

      scope.showTask = ($event, task) => {
        $mdDialog.show({
          targetEvent: $event,
          escapeToClose: false,
          locals: {
            task: task,
            state: state,
            pog: pog
          },
          templateUrl: 'ipr-tracking-card/ipr-tracking-card.task.html',
          controller: 'controller.ipr-tracking-card.task',
          clickOutToClose: false
        }).then(
          (data) => {
            // Update scope copy of task
            _.forEach(state.tasks, (task, i) => {
              if(data.task.ident === task.ident) {
                state.tasks[i] = data.task;
              }
            });
            checkStates();
            // Propagate
            scope.state = state;
          },
          (err) => {
            console.log('Error closing err', err);
          }
        );
      };

      // Trigger State Check
      checkStates();

    } // end link
  }; // end return

}]);
