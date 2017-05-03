app.controller('controller.dashboard.report.probe.summary',
['_', '$q', '$state', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'pog', 'report', 'testInformation', 'genomicEvents',
(_, $q, $state, $scope, $pog, $mdDialog, $mdToast, pog, report, testInformation, genomicEvents) => {

  $scope.pog = pog;
  $scope.report = report;
  $scope.testInformation = testInformation;
  $scope.genomicEvents = genomicEvents;

  // Update Patient Information
  $scope.updatePatient = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/patientInformation.edit.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {

        scope.pi = angular.copy($scope.report.pi); //

        scope.cancel = () => {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = () => {

          // Send updated entry to API
          $patientInformation.update($scope.pog.POGID, report.ident, scope.pi).then(
            (result) => {
              $mdDialog.hide({message: 'Entry has been updated', data: scope.pi});
            },
            (error) => {
              alert('Unable to update. See console');
              console.log(error);
            }
          );

        }; // End update
      }] // End controller

    }).then((outcome) => {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      $scope.data.pi = outcome.data;
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });

  }; // End edit tumour analysis


}]);
