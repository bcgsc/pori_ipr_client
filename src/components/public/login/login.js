app.controller('controller.public.login', ['$q', '_', '$scope', 'api.session', 'api.user', '$state', '$mdToast', ($q, _, $scope, $session, $user, $state, $mdToast) => {
  
  $scope.user = {
    username: null,
    password: null
  };
  
  // Login clicked
  $scope.login = (f) => {
    if(f.$invalid) {
      f.$setDirty();
      angular.forEach(f.$error, (field) => {
        angular.forEach(field, (errorField) => {
          errorField.$setTouched();
        });
      });
      return;
    }

    // Run session login
    $session.login($scope.user.username, $scope.user.password)
      .then($user.me)
      .then((result) => {
        $state.go('dashboard.reports.dashboard');
      })
      .catch((error) => {
        if(error.status === 400) return $mdToast.showSimple('Unable to authenticate with the provided credentials');
        console.log('Error result', error);
      });
  }
  
}]);
