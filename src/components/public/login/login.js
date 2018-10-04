app.controller('controller.public.login', ['$q', '_', '$scope', '$rootScope', '$http',
  'api.session', 'api.user', '$state', '$acl', '$mdToast', '$mdDialog', 'keycloakAuth', ($q, _,
    $scope, $rootScope, $http, $session, $user, $state, $acl, $mdToast, $mdDialog,
    keycloakAuth) => {
    keycloakAuth.setToken()
      .then(() => {
        $user.me()
          .then((response) => {
            $acl.injectUser(response);
            if ($rootScope.returnToState) {
              // navigate to state user was trying to access
              $state.go($rootScope.returnToState, $rootScope.returnToStateParams);
              $rootScope.returnToState = undefined;
              $rootScope.returnToStateParams = undefined;
              return;
            }
            if ($acl.inGroup('clinician')) {
              $state.go('dashboard.reports.genomic');
            } else {
              $state.go('dashboard.reports.dashboard');
            }
          });
      }).catch((err) => {
        console.log(err);
      });

    // $scope.requestAccount = () => {
    //   $mdDialog.show({
    //     templateUrl: 'public/login/requestAccount.html',
    //     controller: 'controller.public.requestAccount',
    //   });
    // };
  }]);
