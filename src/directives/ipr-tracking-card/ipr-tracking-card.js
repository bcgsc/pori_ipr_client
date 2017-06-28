app.directive("iprTrackingCard", ['$q', '_', '$mdDialog', '$mdToast', '$timeout', 'api.tracking.state', ($q, _, $mdDialog, $mdToast, $timeout, $state) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      state: '=state'
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

      scope.getTasks = () => {

        if(scope.showTasks) return scope.showTasks = false;

        scope.showTasks = true;
        scope.state.tasks = [];
        scope.loadingTasks = true;

        // Retrieve tasks
        $state.getState(state.ident).then(
          (result) => {

            scope.state.tasks =_.sortBy(result.tasks, 'ordinal');
            scope.loadingTasks = false;

          },
          (err) => {
            console.log('Unable to get results');
          }
        )

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


      scope.showState = ($event) => {

        scope.showTasks = false;

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
