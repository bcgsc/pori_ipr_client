app.controller('controller.public.login', ['$q', '_', '$scope', 'api.session', '$state', ($q, _, $scope, $session, $state) => {
  
  $scope.user = {
    username: null,
    password: null
  };

  // Check for active session
  $session.$user().then(
    (resp) => {
      if(resp !== null) {
        $state.go('dashboard.listing');
      }
    },
    (err) => {
      console.log('Error', err);
    }
  );

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
    $session.login($scope.user.username, $scope.user.password).then(
      (result) => {
        $state.go('dashboard.listing');
      },
      (error) => {
        // Login failed!
        if(error.status == 400) {
          $scope.form.username.$error.badCredentials = true;
          $scope.form.username.$invalid = true;
          $scope.form.username.$valid = false;
          $scope.form.$dirty = true;
          $scope.form.$valid = false;
          $scope.form.$pristine = false;
          //console.log($scope.form.Username.$error.invalid=true);
          console.log('Could not process');
        }
      }
    );
  }
  
}]);
