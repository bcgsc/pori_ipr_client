app.controller('controller.dashboard.pog',
  ['_', '$scope', '$state', 'api.pog', 'api.image', '$userSettings', 'user', 'reports', 'pog',
    (_, $scope, $state, $pog, $image, $userSettings, user, reports, pog) => {

      $scope.user = user;
      $scope.$state = $state;
      $scope.reports = _.sortBy(reports, ['createdAt']).reverse();
      $scope.pog = pog;
      
    }
  ]
);
