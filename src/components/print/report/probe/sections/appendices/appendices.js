app.controller('controller.print.POG.report.probe.appendices',
  ['_', '$scope', 'pog', 'report', (_, $scope, pog, report) => {

    $scope.report = report;
    $scope.pog = pog;
    $scope.config = report.config.split("\n");

  }]);