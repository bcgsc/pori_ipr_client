app.controller('controller.dashboard.report.genomic.therapeutic',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'api.therapeuticOptions', 'therapeutic',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, $therapeutic, therapeutic) => {

  //$scope.therapeutic = therapeutic;

  $scope.therapeutic = {
    therapeutic: [],
    chemoresistance: []
  };

  // Sort into groups
  let groupTherapeutics = () => {
    _.forEach(therapeutic, (v) => {
      if(v.type === 'therapeutic') $scope.therapeutic.therapeutic.push(v);
      if(v.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(v);
    });
  };

  groupTherapeutics();
  console.log($scope.therapeutic);


}]);
