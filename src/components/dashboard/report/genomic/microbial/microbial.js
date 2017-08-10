app.controller('controller.dashboard.report.genomic.microbial',
['_', '$q', '$scope', 'pog', 'images',
(_, $q, $scope, $state, pog, images) => {
  
  // Load Images into template
  $scope.images = images;
 
}]);
