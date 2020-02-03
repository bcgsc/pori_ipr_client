app.controller('controller.dashboard.report.probe.summary',
['_', '$q', '$state', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'canEdit', 'pog', 'report', 'testInformation', 'genomicEvents', 'api.probe.signature', 'api.summary.patientInformation', 'api.summary.genomicEventsTherapeutic', 'signature', 'api.analysis',
(_, $q, $state, $scope, $pog, $mdDialog, $mdToast, canEdit, pog, report, testInformation, genomicEvents, $signature, $patientInformation, $get, signature, AnalysisService) => {

  $scope.canEdit = canEdit;
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
        scope.pi = angular.copy($scope.pi); //
        scope.analysis = angular.copy($scope.report.analysis);

        scope.cancel = () => {
          $mdDialog.cancel('Patient information was not updated');
        };

        scope.update = (form) => {
          const promises = [];
          if (form.Biopsy.$dirty) {
            // update analysis
            promises.push(AnalysisService.update(scope.analysis));
          }


          // this will always be dirty due to the required comment field
          promises.push($patientInformation.update(
            $scope.pog.POGID,
            $scope.report.ident,
            scope.pi,
          ));

          $q.all(promises)
            .then(([analysis, patientInformation]) => {
              $mdDialog.hide({
                message: 'Patient information has been successfully updated',
                analysis,
                patientInformation,
              });
            })
            .catch((error) => {
              $mdToast.showSimple(
                `Patient information was not updated due to an error: ${error}`,
              );
            });
        }; // End update
      }], // End controller

    })
      .then((outcome) => {
        if (outcome) {
          $mdToast.showSimple(outcome.message);

          if (outcome.analysis) {
            $scope.data.analysis = outcome.analysis;
            $scope.report.analysis = outcome.analysis;
          }

          if (outcome.patientInformation) {
            $scope.data.pi = outcome.patientInformation;
            $scope.report.patientInformation = outcome.patientInformation;
          }
        }
      })
      .catch((error) => {
        $mdToast.showSimple(error);
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
