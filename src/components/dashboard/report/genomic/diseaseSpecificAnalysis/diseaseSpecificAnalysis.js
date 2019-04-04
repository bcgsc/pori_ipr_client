app.controller('controller.dashboard.report.genomic.diseaseSpecificAnalysis',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'images', 'subtypePlotImages',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, images, subtypePlotImages) => {

      // Load Images into template
      $scope.images = images;

      // Load Subtype Plot Images into template
      $scope.subtypePlotImages = subtypePlotImages;
      $scope.hasSubtypePlot = !(Object.keys(subtypePlotImages).length === 0);

    }
  ]
);
