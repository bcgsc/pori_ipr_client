app.controller('controller.public.login',
  ['$q', '_', '$scope', '$rootScope', '$http', 'api.session', 'api.user', '$state', '$acl', '$mdToast', '$mdDialog', 'keycloakAuth',
    ($q, _, $scope, $rootScope, $http, $session, $user, $state, $acl, $mdToast, $mdDialog, keycloakAuth) => {
      // $session.login();
      // $scope.user = {
      //   username: null,
      //   password: null,
      // };

      keycloakAuth.setToken()
        .then((res) => {
          console.log(res);
          console.log(keycloakAuth.getToken());
          $user.me().then((response) => {
            console.log(response);
          });
        });
      // $user.me().then((res) => {
      //   console.log(res);
      // });
  
      // Login clicked
      $scope.login = (f) => {
        if (f.$invalid) {
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
          
        } else {
          $state.go('dashboard.reports.dashboard');
          
        }
      })
          .catch((error) => {
            if (error.status === 400) return $mdToast.showSimple('Unable to authenticate with the provided credentials');
            console.log('Error result', error);
          });
      };

      // $scope.requestAccount = () => {
      //   $mdDialog.show({
      //     templateUrl: 'public/login/requestAccount.html',
      //     controller: 'controller.public.requestAccount',
      //   });
      // };
    }]);
