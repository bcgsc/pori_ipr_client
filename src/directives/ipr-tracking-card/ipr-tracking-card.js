app.directive("iprTrackingCard", ['$q', '_', '$mdDialog', '$mdToast', '$timeout', 'api.tracking.state', 'api.socket', ($q, _, $mdDialog, $mdToast, $timeout, $state, socket) => {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      state: '=state',
      noTasks: '=?noTasks'
    },
    templateUrl: 'ipr-tracking-card/ipr-tracking-card.html',
    link: (scope, element, attr) => {

      // Add state status to classList
      element[0].classList.add(scope.state.status);

      let pog = scope.pog = scope.state.analysis.pog;
      let analysis = scope.analysis = scope.state.analysis;
      let state = scope.state;
      
      // Sort Tasks by ordinal
      scope.state.tasks = state.tasks =_.sortBy(scope.state.tasks, 'ordinal');
      scope.showTasks = false;
      scope.error = false; // Default error state
      scope.priority = new Array(analysis.priority);
      scope.disableTasks = (scope.noTasks !== undefined);

      // Check if there are any failed tasks
      let checkStates = () => {
        scope.error = (_.find(scope.state.tasks, {status: 'failed'})) ? true : false;
        scope.hold =  (_.find(scope.state.tasks, {status: 'hold'})) ? true : false;
      };

      // Listen for changes to any task in this state
      socket.on('taskStatusChange', (task) => {
        if(task.state.ident === scope.state.ident) {
          checkStates();
        }
      });

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

      scope.getTasks = () => {
        scope.showTasks = !scope.showTasks;
      };

      let checkTaskCompletion = () => {

        let completeTasks = 0;

        _.forEach(state.tasks, (task, i) => {
          if(task.status === 'complete') completeTasks++;
        });

        if(completeTasks === state.tasks.length) {
          // Add new state class
          element[0].classList.remove(scope.state.status);
          scope.state.status = 'complete';
          // Add new state class
          element[0].classList.add(scope.state.status);
        }

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
            // Update scope copy of task - Check for completeness
            _.forEach(state.tasks, (task, i) => {
              if(data.task.ident === task.ident) state.tasks[i] = data.task;
            });

            checkStates();
            checkTaskCompletion();
            // Propagate
            scope.state = state;
          },
          (err) => {
            console.log('Error closing err', err);
          }
        );
      };


      scope.showState = ($event) => {

        $mdDialog.show({
          targetEvent: $event,
          escapeToClose: false,
          locals: {
            state: state,
            pog: pog
          },
          templateUrl: 'ipr-tracking-card/ipr-tracking-card.state.html',
          controller: 'controller.ipr-tracking-card.state',
          clickOutToClose: false
        }).then(
          (data) => {
            // Remove Previous state class
            element[0].classList.remove(scope.state.status);

            checkStates();
            // Propagate
            scope.state = data.state;
            state = data.state;
            scope.state.tasks = _.sortBy(data.state.tasks, 'ordinal');

            // Add new state class
            element[0].classList.add(scope.state.status);
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
