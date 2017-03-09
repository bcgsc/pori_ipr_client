app.controller('controller.dashboard.toolbar.feedback', ['$q', '_', 'scope', 'api.jira', 'api.user', '$mdDialog', ($q, _, scope, $jira, $user, $mdDialog) => {

  // Close Modal
  scope.cancel = () => {
    $mdDialog.cancel();
  };

  scope.feedback = {};
  scope.showForm = true;
  scope.ticket = {
    id: "131420",
    key: "UGNE-1429",
    self: "https://www.bcgsc.ca/jira/rest/api/2/issue/131420"
  };

  // Send Feedback!
  scope.send = (f) => {

    scope.formSubmitted = true;

    scope.close = () => {
      $mdDialog.hide();
    };

    // Append type to title
    let title = scope.feedback.type + ': '+scope.feedback.title;

    // Send feedback to jira
    $jira.ticket.subtask('UGNE-1414', title, scope.feedback.description).then(
      (res) => {
        // Response handled
        scope.showForm = false;
        scope.ticket = res;
        console.log('JIRA subtask create response: ', res);
      },
      (err) => {
        console.log('Unable to send feedback', err);
      }
    );


  }


}]);