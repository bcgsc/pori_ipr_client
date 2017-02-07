app.controller('controller.dashboard.report.genomic.diseaseSpecificAnalysis',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'images',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, images) => {

      // Load Images into template
      $scope.images = images;

    }
  ]
);
