app.controller('controller.dashboard.pog.report.listing',
  ['_', '$scope', '$state', 'api.pog', 'api.image', '$userSettings', 'user', 'reports', 'pog',
    (_, $scope, $state, $pog, $image, $userSettings, user, reports, pog) => {

      $scope.user = user;
      $scope.$state = $state;
      $scope.reports = reports;
      $scope.pog = pog;

      console.log('Report Listing', reports);

    }
  ]
);
