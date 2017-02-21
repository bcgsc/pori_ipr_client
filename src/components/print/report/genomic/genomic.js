app.controller('controller.print.POG.report.genomic',
  ['_', '$scope', 'pog', 'gai', 'get', 'ms', 'vc', 'pt', 'comments',
  (_, $scope, pog, gai, get, ms, vc, pt, comments) => {

    // Data
    $scope.data = {gai: gai, ms: ms, vc: vc, pt: pt, pi: pog.patientInformation, ta: pog.tumourAnalysis };

    $scope.data.get = [];
    $scope.data.get[0] = _.chunk(get, 11)[0];
    $scope.data.get[1] = _.chain(get).chunk(11).tail().flatten().value();
    $scope.comments;

    console.log($scope.data);

    $scope.pog = pog;

    $scope.col1 = 10;
    $scope.col2 = 25;
    $scope.col3 = 10;
    $scope.col4 = 25;
    $scope.col5 = 10;
    $scope.col6 = 35;

    $scope.mutationBurdenFilter = (input) => {
      return (input == "nan [nan]") ? 'na' : input.replace(/\[[0-9]*\]/g, '');
    }

  }]
);