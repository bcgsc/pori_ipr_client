app.controller('controller.dashboard.report.genomic.therapeutic',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'api.therapeuticOptions', 'therapeutic',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, $therapeutic, therapeutic) => {

  $scope.therapeutic = {
    therapeutic: [],
    chemoresistance: []
  };

  // Sort into groups
  let groupTherapeutics = () => {
    _.forEach(therapeutic, (v) => {
      if(v.type === 'therapeutic') {
        let targets = [];
        _.forEach(v.target, (e) => {
          targets.push((angular.isObject(e)) ? e : {geneVar: e});
        });
        v.target = targets;
        $scope.therapeutic.therapeutic.push(v);
      }
      if(v.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(v);
    });
  };

  groupTherapeutics();

  // Edit Therapeutic Targets
  $scope.edit = ($event, entry) => {
    $mdDialog.show({
      targetEvent: $event,
      clickOutsideToClose: false,
      locals: {
        newEntry: false,
        entry: entry,
        pog: pog
      },
      templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.edit.html',
      controller: 'controller.dashboard.report.genomic.therapeutic.edit'
    });
  };

  $scope.newEntry = ($event, type) => {

    // Create new entry by type
    $mdDialog.show({
      targetEvent: $event,
      clickOutsideToClose: false,
      locals: {
        newEntry: type,
        entry: false,
        pog: pog
      },
      templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.edit.html',
      controller: 'controller.dashboard.report.genomic.therapeutic.edit'
    }).then(
      (result) => {
        if(result.type === 'therapeutic') {
          let targets = [];
          _.forEach(result.target, (e) => {
            targets.push((angular.isObject(e)) ? e : {geneVar: e});
          });
          result.target = targets;
          $scope.therapeutic.therapeutic.push(result);
        }
        if(result.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(result);
      }
    );

  };


}]);
