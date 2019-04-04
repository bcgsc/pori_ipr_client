app.controller('controller.dashboard.toolbar.feedback', ['$q', '_', 'scope', 'api.jira', 'api.user', '$mdDialog', ($q, _, scope, $jira, $user, $mdDialog) => {

  // Close Modal
  scope.cancel = () => {
    $mdDialog.cancel();
  };

}]);