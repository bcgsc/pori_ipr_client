app.controller('controller.print.POG.report.genomic.appendices',
['_', '$scope', 'pog', 'report', 'tcgaAcronyms',
(_, $scope, pog, report, tcgaAcronyms) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.tcgaAcronyms = tcgaAcronyms;

  $scope.config = report.config.split("\n");

}]);