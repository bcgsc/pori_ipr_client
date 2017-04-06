app.controller('controller.dashboard',
  ['_', '$scope', 'api.pog', 'api.image', 'user', 'isAdmin',
    (_, $scope, $pog, $image, user, isAdmin) => {

      $scope.isAdmin = isAdmin;
      $scope.user = user;

      $scope.maximized = true;
      $scope.toggle = () => {
        $scope.maximized = !$scope.maximized;
      }

    }
  ]
);
