app.controller('controller.dashboard.toolbar.feedback', ['$q', '_', 'scope', 'api.jira', 'api.user', 'api.session', '$mdDialog', ($q, _, scope, $jira, $user, $session, $mdDialog) => {

  // Close Modal
  scope.cancel = () => {
    $mdDialog.cancel();
  };

}]);