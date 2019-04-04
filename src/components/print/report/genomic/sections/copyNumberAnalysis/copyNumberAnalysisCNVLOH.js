app.controller('controller.print.POG.report.genomic.copyNumberAnalysisCNVLOH',
['_', '$scope', '$sce', 'pog', 'report', 'cnvlohImages',
(_, $scope, $sce, pog, report, cnvlohImages) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = cnvlohImages;

}]);