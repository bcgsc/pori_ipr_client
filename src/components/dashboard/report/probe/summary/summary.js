app.controller('controller.dashboard.report.probe.summary',
['_', '$q', '$state', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'pog', 'report', 'testInformation', 'genomicEvents', 'api.probe.signature', 'api.summary.patientInformation', 'api.summary.genomicEventsTherapeutic', 'signature',
(_, $q, $state, $scope, $pog, $mdDialog, $mdToast, pog, report, testInformation, genomicEvents, $signature, $patientInformation, $get, signature) => {

  $scope.pog = pog;
  $scope.pi = pog.patientInformation;
  $scope.report = report;
  $scope.testInformation = testInformation;
  $scope.genomicEvents = genomicEvents;
  $scope.signature = signature;

  // Update Patient Information
  $scope.updatePatient = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/patientInformation.edit.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {

        scope.pi = angular.copy($scope.report.patientInformation); //

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


  // Sign The comments
  $scope.sign = (role) => {

    // Send signature to API
    $signature.sign(pog.POGID, report.ident, role).then(
      (result) => {
        $scope.signature = result;
      }
    )
  };

  // Sign The comments
  $scope.revokeSign = (role) => {

    // Send signature to API
    $signature.revoke(pog.POGID, report.ident, role).then(
      (result) => {
        $scope.signature = result;
      }
    )
  };



  // Update Patient Information
  $scope.modifyEvent = ($event, event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/probe/summary/summary.events.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {

        scope.event = angular.copy(event);

        scope.cancel = () => {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = () => {

          // Send updated entry to API
          $get.update($scope.pog.POGID, report.ident, event.ident, scope.event).then(
            (result) => {
              $mdDialog.hide({message: 'Entry has been updated', data: result});
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
      _.forEach($scope.genomicEvents, (e, i) => {
        if(e.ident === outcome.data.ident) $scope.genomicEvents[i] = outcome.data;
      });
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent('No changes were saved.'));
    });

  }; // End edit tumour analysis

}]);
