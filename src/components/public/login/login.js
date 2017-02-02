app.controller('controller.public.login', ['$q', '_', '$scope', 'api.session', '$state', ($q, _, $scope, $session, $state) => {
  
  $scope.user = {
    username: null,
    password: null
  }
  
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
    
    $session.login($scope.user.username, $scope.user.password).then(
      (result) => {
        $state.go('dashboard.listing');
      },
      (error) => {
        console.log('[Login.js] Failed to login', error);
      }
    );
  }
  
}]);
