app.controller('controller.dashboard.tracking.assignment',
['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', 'api.jira', '$mdDialog', '$mdToast', 'definition', 'states', 'group', 'userLoad',
($q, _, $scope, $definition, $state, $task, $jira, $mdDialog, $mdToast, definition, states, group, userLoad) => {

  $scope.definition = definition;
  $scope.assign = {};
  $scope.group = group;
  $scope.states = states;
  $scope.userLoad = userLoad;

  // Click state becomes active
  $scope.selectState = (state) => {
    $scope.assign = state;
  };

  // Cancel editing the selected state
  $scope.cancelAnalysis= () => {
    $scope.assign = {};
    $mdToast.show($mdToast.simple().textContent('No changes have been saved.'));
  };

  // The select all checkbox state has changed
  $scope.selectAllChanged = () => {
    _.forEach($scope.assign.taskSelection, (v, i) => {
      $scope.assign.taskSelection[i] = $scope.selectAll;
    });
  };

  // Toggle row selection for task
  $scope.clickToggle = (value) => {
    console.log('Passed value', value);
    return value = !value;
  };

  // Simple get percentage with floor
  $scope.getFloor = (value) => {
    return Math.floor(value);
  };

  // Submit new assignments for all checked tasks
  $scope.assignUsers = (task) => {
    // Lock assign button
    $scope.assign.submitting = true;

    let promises = [];

    _.forEach($scope.assign.taskSelection, (set, task) => {
      if(set) promises.push($task.assignUser(task, $scope.assign.user));
    });

    $q.all(promises).then(
      (result) => {

        // Load users, apply and get updated values
        $definition.userLoad(definition.ident).then(
          (ul) => {
            $scope.userLoad = userLoad = ul;

            $scope.assign.submitting = false;
            $mdToast.show($mdToast.simple().textContent('The selected user has been bound'));
            $scope.assign.user = null;
            $scope.UserAssignment.$setPristine();

            _.forEach(result, (t) => {

              _.forEach($scope.assign.tasks, (at, i) => {

                if(t.ident === at.ident) $scope.assign.tasks[i] = t;

              });

            });


            // Reset list of tasks checkboxes
            _.forEach($scope.assign.taskSelection, (uc, k) => {
              $scope.assign.taskSelection[k] = false;
            });
            // Reset all Checkbox
            $scope.selectAll = false;

          },
          (err) => {
            console.log('Unable to load userLoad details');
          }
        );

        // Create JIRA ticket
        if($scope.assign.jira === null) {
          //$jira.ticket.create(13713, 3, 'REST API Test Ticket', 'This is a description')
        }

      },
      (err) => {
        console.log('Failed to update tasks:', err);
      }
    )

  };


}]);