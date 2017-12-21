app.controller('controller.dashboard.tracking.definition.hook',
['$scope', '_', '$interpolate', '$mdDialog', '$mdToast', 'api.tracking.hook', 'tasks', 'hook', 'definition',
($scope, _, $interpolate, $mdDialog, $mdToast, $hook, tasks, hook, definition) => {
  
  $scope.hook = hook;
  $scope.tasks = tasks;
  
  $scope.hook.target_string = _.join(hook.target, ', ');
  
  $scope.cancel = () => {
    $mdDialog.cancel();
  };
  
  $scope.submit = (f) => {
    
    // Recreate target list
    $scope.hook.target = $scope.hook.target_string.split(',').map((i) => { console.log(i.trim()); return i.trim();})
    
    
    // Create or Save
    if(hook.ident && hook.ident.length > 0) {
      // Save
      
      $hook.update(hook.ident, hook)
        .then((resp) => {
          $mdDialog.hide(resp);
        })
        .catch((e) => {
          $mdToast.showSimple('Failed to update the hook: ' + e.data.message);
        });
      
    } else {
      
      $scope.hook.state_name = definition.slug;
      // Create
      $hook.create(hook)
        .then((resp) => {
          $mdDialog.hide(resp);
        })
        .catch((e) => {
          $mdToast.showSimple('Failed to create the hook: ' + e.data.message);
        });
    }
    
  }
  
}]);