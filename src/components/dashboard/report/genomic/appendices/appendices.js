app.controller('controller.dashboard.report.genomic.appendices',
  ['_', '$q', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'pog',
    (_, $q, $scope, $pog, $mdDialog, $mdToast, pog) => {

      $scope.pog = pog;

    }
  ]
);
