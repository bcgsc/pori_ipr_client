app.controller('controller.public.login', 
['$q', '_', '$scope', '$rootScope', 'api.session', 'api.user', '$state', '$acl', '$mdToast', '$mdDialog', 
($q, _, $scope, $rootScope, $session, $user, $state, $acl, $mdToast, $mdDialog) => {
  
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
        $acl.injectUser(result);

        if($rootScope.returnToState) {
          // navigate to state user was trying to access
          $state.go($rootScope.returnToState, $rootScope.returnToStateParams);
          // reset return to state fields
          $rootScope.returnToState = undefined;
          $rootScope.returnToStateParams = undefined;
          return;
        }
        
        if($acl.inGroup('clinician')) {
          $state.go('dashboard.reports.genomic');
          return;
        } else {
          $state.go('dashboard.reports.dashboard');
          return;
        }
      })
      .catch((error) => {
        if(error.status === 400) return $mdToast.showSimple('Unable to authenticate with the provided credentials');
        console.log('Error result', error);
      });
  }

  $scope.requestAccount = () => {
    $mdDialog.show({
      templateUrl: 'public/login/requestAccount.html',
      controller: 'controller.public.requestAccount'
    });
  }
  
}]);
