app.controller('controller.print.POG.report.genomic.slide',
['_', '$scope', 'pog', 'report', 'slides',
(_, $scope, pog, report, slides) => {
  
  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.slides = slides;
  
}]);