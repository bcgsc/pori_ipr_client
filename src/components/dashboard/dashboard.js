app.controller('controller.dashboard', ['_', '$scope', 'api.pog', 'api.image', 'user', (_, $scope, $pog, $image, user) => {

  $scope.user = user;

}]);
