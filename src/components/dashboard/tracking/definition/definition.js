app.controller('controller.dashboard.tracking.definition',
['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', '$mdDialog', '$mdToast', 'definitions', 'groups', 'hooks',
($q, _, $scope, $definition, $state, $task, $mdDialog, $mdToast, definitions, groups, hooks) => {

  $scope.definitions = _.sortBy(definitions, 'ordinal');
  
  $scope.editing = {};
  $scope.groups = groups;
  $scope.hooks = hooks;

  $scope.selectDefinition = (definition) => {
    $scope.editing = definition;
    $scope.editing.new = false;
  };

  $scope.newDefinition = () => {
    $scope.editing = { name: null, new:true, tasks: [] };
  };

  $scope.cancelEditing = () => {
    $scope.editing = {};
    $mdToast.show($mdToast.simple().textContent('No changes have been saved.'));
  };
  
  $scope.getHooksByState = (state) => {
    return _.filter($scope.hooks, {state_name: state});
  };
  
  $scope.openHook = (hook) => {
    
    $mdDialog.show({
      templateUrl: 'dashboard/tracking/definition/definition.hook.html',
      controller: 'controller.dashboard.tracking.definition.hook',
      locals: {
        hook: hook,
        tasks: $scope.editing.tasks,
        definition: $scope.editing
      }
    })
      .then((h) => {
        if(!_.find($scope.hooks, {ident: h.ident})) $scope.hooks.push(h);
      })
      .catch((e) => {
        console.log('Hook save Error', e);
      });
    
  };

  // Save Definitions editor form
  $scope.save = () => {

    // Validate Form

    // Get Group Ident
    $scope.entry = angular.copy($scope.editing);
    $scope.entry.group = $scope.editing.group;

    // Updating or Editing
    if($scope.editing.new) {

      $scope.editing.ordinal = $scope.definitions.length + 1;

      $definition.create($scope.entry).then(
        (result) => {
          $scope.definitions.push(result);
          $scope.editing = {};
        },
        (err) => {
          console.log('Failed to create definition');
          $mdToast.show($mdToast.simple('Failed to create new definition'));
        }
      )

    } else {

      // Submit to DB
      $definition.update($scope.editing.ident, $scope.entry).then(
        (result) => {

          // Find existing and replace
          let i = _.findIndex($scope.definitions, {ident: result.ident});

          $scope.definitions[i] = result;
          definitions = $scope.definitions;

          $mdToast.show($mdToast.simple().textContent('The definition has been saved'));

        },
        (err) => {

        }
      )
    }

  };

  // Open Task Editor
  $scope.taskEditor = ($event, task=false, i=null) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/tracking/definition/definition.task.html',
      controller: ['$q', 'scope', ($q, scope) => {

        let taskCopy = angular.copy(task);

        scope.new = (typeof task !== "object");
        scope.task = (typeof task !== "object") ? {status: 'pending', checkInsTarget: 1, } : task;
        scope.taskIndex = i;

        scope.cancel = () => {
          $mdDialog.cancel();
          task = taskCopy;
        };

        scope.submit = (f) => {
          // Check Validation

          if(scope.new) $scope.editing.tasks.push(scope.task);

          $mdDialog.hide();
        };

        // Remove the current entry
        scope.remove = () => {

          $scope.editing.tasks.splice(i,1);
          $mdDialog.hide();
        };

      }]
    })

  };

  // Update ordinal of definitions
  $scope.updateOrdinal = () => {

    // Array of promises to be watched
    let promises = [];

    // Loop over entries and set ordinal, then update entry
    _.forEach($scope.definitions, (def, i) => {

      $scope.definitions[i].ordinal = i+1;

      // Update definitions
      promises.push($definition.update(def.ident, def))

    });

    $q.all(promises).then(
      (result) => {
        $mdToast.show($mdToast.simple().textContent('Updated order has been saved'));
      },
      (err) => {
        console.log('Unable to update definition ordinals', err);
      }
    )



  }



}]);