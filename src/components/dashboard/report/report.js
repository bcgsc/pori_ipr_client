app.controller('controller.dashboard.pog.report',
  ['_', '$scope', '$state', 'api.pog', 'api.image', '$userSettings', 'user', 'report',
    (_, $scope, $state, $pog, $image, $userSettings, user, report) => {

      $scope.user = user;
      $scope.$state = $state;
      $scope.report = report;

      console.log('Report', report);

    }
  ]
);
