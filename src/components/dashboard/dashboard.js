app.controller('controller.dashboard',
  ['_', '$scope', '$state', 'api.pog', 'api.image', 'user', 'isAdmin',
    (_, $scope, $state, $pog, $image, user, isAdmin) => {

      $scope.isAdmin = isAdmin;
      $scope.user = user;
      $scope.$state = $state;

      $scope.maximized = true;
      $scope.toggle = () => {
        $scope.maximized = !$scope.maximized;
      }

    }
  ]
);
