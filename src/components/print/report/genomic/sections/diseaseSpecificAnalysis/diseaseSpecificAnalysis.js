app.controller('controller.print.POG.report.genomic.diseaseSpecificAnalysis',
['_', '$scope', '$sce', 'pog', 'report', 'images', 'subtypePlotImages',
(_, $scope, $sce, pog, report, images, subtypePlotImages) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.subtypePlotImages = subtypePlotImages;
  $scope.hasSubtypePlot = !(Object.keys(subtypePlotImages).length === 0);

}]);