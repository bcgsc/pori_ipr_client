app.controller('controller.dashboard.report.genomic.therapeutic',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'api.therapeuticOptions', 'therapeutic',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, $therapeutic, therapeutic) => {

  $scope.therapeutic = {
    therapeutic: [],
    chemoresistance: []
  };

  $scope.rowOptions = [];

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
        pog: pog,
        report: report
      },
      templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.edit.html',
      controller: 'controller.dashboard.report.genomic.therapeutic.edit'
    }).then(
      (result) => {
        // If an existing entry was updated
        if(result.status === 'updated') {
          let data = result.data;

          if(data.type === 'therapeutic') data.target = cleanTargets(data.target);

          // Loop over entries in type, find matching ident, and replace
          _.forEach($scope.therapeutic[data.type], (e, i) => {
            if(e.ident === data.ident) $scope.therapeutic[data.type][i] = e;
          });

          $mdToast.show($mdToast.simple({textContent: 'Changes saved'}));
        }

        // Removing an entry
        if(result.status === 'deleted') {
          let data = result.data;
         _.remove($scope.therapeutic[data.type], (e) => {return (e.ident === data.ident); });
          $mdToast.show($mdToast.simple({textContent: 'The entry has been removed'}));
        }
      },
      () => {
        $mdToast.show($mdToast.simple({textContent: 'No changes were made.'}));
      }
    );
  };

  /**
   * Turn collection into array of targets
   *
   * @param targets
   * @returns {Array}
   */
  let cleanTargets = (targets) => {
    let newTargets = [];
    _.forEach(data.target, (e) => {
      targets.push((angular.isObject(e)) ? e : {geneVar: e});
    });
    return newTargets;
  };

  $scope.newEntry = ($event, type) => {

    // Create new entry by type
    $mdDialog.show({
      targetEvent: $event,
      clickOutsideToClose: false,
      locals: {
        newEntry: type,
        entry: false,
        pog: pog,
        report: report
      },
      templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.edit.html',
      controller: 'controller.dashboard.report.genomic.therapeutic.edit'
    }).then(
      (result) => {
        let data = result.data;

        // If therapeutic
        if(data.type === 'therapeutic') {
          data.target = cleanTargets(data.target);
          $scope.therapeutic.therapeutic.push(data);
        }
        if(data.type === 'chemoresistance') $scope.therapeutic.chemoresistance.push(data);

        $mdToast.show($mdToast.simple({textContent: 'New entry saved'}));
      },
      (cancel) => {
        $mdToast.show($mdToast.simple({textContent: 'No changes were made'}));
      }
    );

  };


}]);
