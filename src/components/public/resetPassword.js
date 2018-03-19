
app.controller('controller.public.resetPassword',
['$q', '_', '$scope', 'api.session', 'api.user', '$state', '$acl', '$mdToast', 
($q, _, $scope, $session, $user, $state, $acl, $mdToast) => {

  $scope.email = null;
  $scope.resetSent = false;
  
  // reset password submit
  $scope.reset = (f) => {
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
    $session.resetPassword($scope.email)
      .then(
        (resp) => {
          $scope.resetSent = true;
        },
        (err) => {
          if(err.status == 404) return $mdToast.showSimple('Unable to find user registered with provided email');
          $mdToast.showSimple('Unable to send password reset link');
          console.log('Error result', err);
        }
      )
      .catch((error) => {
        if(error.status == 400) return $mdToast.showSimple('Unable to authenticate with the provided credentials');
        console.log('Error result', error);
      });
  }

  $scope.returnToLogin = () => {
    $state.go('public.login');
  }
  
}]);
