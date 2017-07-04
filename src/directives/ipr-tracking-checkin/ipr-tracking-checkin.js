app.directive("iprTrackingCheckin", ['$q', '_', '$mdDialog', '$mdToast', '$state', '$timeout', 'api.tracking.task', 'moment', ($q, _, $mdDialog, $mdToast, $state, $timeout, $task, moment) => {


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

        // If date, reformat
        if(scope.type === 'date') {
          scope.outcome.value = moment(scope.outcome.value).toISOString();
        }
        
        // Building check-in body
        $task.checkInTaskIdent(task.ident, scope.outcome.value).then(
          (result) => {
            scope.task = result;
            task = scope.task;
          },
          (err) => {
            console.log('Failed to check-in', err);

            let message = "";

            message += "Failed to perform checkin.";

            if(err.data.error && err.data.error.cause && err.data.error.cause.error && err.data.error.cause.error.message) {
              message += " Reason: " + err.data.error.cause.error.message;
            }

            $mdToast.show($mdToast.simple().textContent(message));
          }
        )

      }

    } // end link
  }; // end return

}]);
