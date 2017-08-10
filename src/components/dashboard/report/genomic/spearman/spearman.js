app.controller('controller.dashboard.report.genomic.spearman',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'images',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, images) => {
  
  // Load Images into template
  $scope.images = images;

  // Convert full hex to 6chr
  $scope.colourHex = (hex) => {
    return hex.match(/([A-z0-9]{6}$)/)[0];
  };
  
}]);
