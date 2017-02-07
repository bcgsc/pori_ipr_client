app.controller('controller.dashboard.report.genomic.copyNumberAnalyses',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'pog', 'ms', 'images',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, pog, ms, images) => {

      // Load Images into template
      $scope.images = images;
      $scope.pog = pog;
      $scope.smallMutations = {};



    }
  ]
);
