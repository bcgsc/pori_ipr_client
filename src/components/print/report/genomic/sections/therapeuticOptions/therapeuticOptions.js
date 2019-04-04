app.controller('controller.print.POG.report.genomic.therapeuticOptions',
['_', '$scope', '$sce', 'pog', 'report', 'therapeutic',
(_, $scope, $sce, pog, report, therapeutic) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.therapeutic = {therapeutic: [], chemoresistance: []};

  // Sort into groups
  let groupTherapeutics = () => {
    _.forEach(therapeutic, (v) => {
      if(v.type === 'therapeutic') $scope.therapeutic.therapeutic.push(v);
      if(v.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(v);
    });
  };

  groupTherapeutics();

}]);