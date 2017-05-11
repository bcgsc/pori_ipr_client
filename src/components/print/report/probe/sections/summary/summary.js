app.controller('controller.print.POG.report.probe.summary',
['_', '$scope', 'pog', 'report', 'testInformation', 'genomicEvents', 'metrics', (_, $scope, pog, report, testInformation, genomicEvents, kbmetrics) => {

  // Data
  $scope.data = {pi: report.patientInformation, ta: report.tumourAnalysis};

  $scope.report = report;
  $scope.pog = pog;
  $scope.testInformation = testInformation;
  $scope.genomicEvents = genomicEvents;
  $scope.kbmetrics = kbmetrics;

  console.log('KB Metrics', kbmetrics);

}]);