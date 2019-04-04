app.controller('controller.print.POG.report.genomic.diseaseSpecificAnalysis',
['_', '$scope', '$sce', 'pog', 'report', 'diseaseImages', 'subtypePlotImages',
(_, $scope, $sce, pog, report, diseaseImages, subtypePlotImages) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = diseaseImages;
  $scope.subtypePlotImages = subtypePlotImages;
  $scope.hasSubtypePlot = !(Object.keys(subtypePlotImages).length === 0);

}]);