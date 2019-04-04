app.controller('controller.print.POG.report.genomic',
['_', '$scope', '$timeout', '$sce', 'pog', 'report',
(_, $scope, $timeout, $sce, pog, report) => {


  //$scope.pathwayAnalysis = pathway;
  $scope.samples = [];
  $scope.report = report;
  $scope.pog = pog;

}]);