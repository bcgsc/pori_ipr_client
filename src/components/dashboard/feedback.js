app.controller('controller.dashboard.toolbar.feedback', ['$q', '_', 'scope', 'api.jira', 'api.user', 'api.session', '$mdDialog', ($q, _, scope, $jira, $user, $session, $mdDialog) => {

  // Close Modal
  scope.cancel = () => {
    $mdDialog.cancel();
  };

  scope.feedback = {};
  scope.state= "form";

  scope.user = {
    username: '',
    password: ''
  };

  scope.login = {
    badCredentials: false,
    submitting: false
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
    $jira.ticket.create('DEVSU', 'Task', title, scope.feedback.description, {components: [ { name: 'IPR WebApp' }], labels: ['Feedback', scope.feedback.type ]}).then(
      (res) => {
        // Response handled
        scope.state = 'issue';
        scope.ticket = res;
        console.log('JIRA subtask create response: ', res);
      },
      (err) => {
        console.log('Unable to send feedback', err);
      }
    );
  };

}]);