app.directive("iprTrackingCheckin", ['$q', '_', '$mdDialog', '$mdToast', '$state', '$timeout', 'api.tracking.task', ($q, _, $mdDialog, $mdToast, $state, $timeout, $task) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      state: '=state',
      task: '=task',
    },
    templateUrl: 'ipr-tracking-checkin/ipr-tracking-checkin.html',
    link: (scope, element, attr) => {

      let task = scope.task;
      let state = scope.state;

      scope.type = task.outcomeType;

      // Build response object
      scope.outcome = {
        type: task.outcomeType,
        value: null
      };

      /** Submit Check-in **/
      scope.checkin = () => {

        // Building check-in body
        $task.checkInTaskIdent(task.ident, scope.outcome.value).then(
          (result) => {
            scope.task = result;
            task = scope.task;
            console.log('Successful check-in!', result);
          },
          (err) => {
            console.log('Failed to check-in', err);
          }
        )

      }

    } // end link
  }; // end return

}]);
