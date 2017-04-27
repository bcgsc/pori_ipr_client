app.controller('controller.dashboard',
  ['_', '$scope', '$state', 'api.pog', 'api.image', '$userSettings', 'user', 'isAdmin',
    (_, $scope, $state, $pog, $image, $userSettings, user, isAdmin) => {

      $scope.isAdmin = isAdmin;
      $scope.user = user;
      $scope.$state = $state;

      $scope.maximized = $userSettings.get('sideBarState');
      $scope.toggle = () => {
        $userSettings.save('sideBarState', !$scope.maximized);
        $scope.maximized = !$scope.maximized;
      }

    }
  ]
);
