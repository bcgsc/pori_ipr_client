app.controller('controller.print.POG.report.genomic.diseaseSpecificAnalysis',
['_', '$scope', '$sce', 'pog', 'report', 'images',
(_, $scope, $sce, pog, report, images) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;

}]);