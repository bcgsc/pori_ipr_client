app.controller('controller.dashboard',
  ['_', '$rootScope', '$scope', '$state', 'api.pog', 'api.image', '$userSettings', 'user', 'isAdmin', '$acl', 'toastService',
    (_, $rootScope, $scope, $state, $pog, $image, $userSettings, user, isAdmin, $acl, toastService) => {
      
      $scope.check = {
        resource: $acl.resource,
      };
      
      $scope.isAdmin = isAdmin;
      $scope.user = user;
      $scope.$state = $state;

      $scope.maximized = $userSettings.get('sideBarState');
      $rootScope.$on( 'sidebarToggle', (event, eventData) => {
        $userSettings.save('sideBarState', !$scope.maximized);
        $scope.maximized = !$scope.maximized;
      });

    }
  ]
);
