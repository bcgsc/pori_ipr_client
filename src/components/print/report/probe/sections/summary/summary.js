app.controller('controller.print.POG.report.probe.summary',
['_', '$scope', 'pog', 'report', 'testInformation', 'genomicEvents', (_, $scope, pog, report, testInformation, genomicEvents) => {

  // Data
  $scope.data = {pi: report.patientInformation, ta: report.tumourAnalysis};

  $scope.report = report;
  $scope.pog = pog;
  $scope.testInformation = testInformation;
  $scope.genomicEvents = genomicEvents;

}]);