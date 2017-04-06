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
    $jira.ticket.subtask(CONFIG.JIRA.TICKETS.FEEDBACK, title, scope.feedback.description).then(
      (res) => {
        // Response handled
        scope.state = 'issue';
        scope.ticket = res;
        console.log('JIRA subtask create response: ', res);
      },
      (err) => {

        // Check for handlable errors
        if(err.status === 400) {

          // Stale Jira Token
          if(err.data.error && err.data.error.code === "JiraAuthStale") {
            // Change state to login
            scope.state = 'login';
          }
        }
        console.log('Unable to send feedback', err);
      }
    );
  };

  /* refresh JIRA authentication */
  scope.login = () => {

    scope.login.submitting = true;

    // Run session login
    $session.login(scope.user.username, scope.user.password).then(
      (result) => {
        scope.login.submitting = false;
        scope.user.username = '';
        scope.user.password = '';
        // Refreshed the token! Send the ticket again!
        console.log('Good auth, resubmitting form!');
        scope.send(scope.form);
      },
      (error) => {
        scope.login.submitting = false;
        // Login failed!
        if(error.status === 400) {
          scope.login.badCredentials = true;
          console.log('Bad Credentials');
        }
      }
    );
  }


}]);