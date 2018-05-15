app.controller('knowledgebase.references.view',
['$q', '_', '$scope', '$mdDialog', '$mdToast', '$kbUtils', 'api.knowledgebase', 'reference', 'history','vocabulary', 'externalMode',
($q, _, scope, $mdDialog, $mdToast, $kbUtils, $kb, reference, history, vocabulary, externalMode) => {

  scope.reference = reference;
  scope.history = history;
  scope.vocabulary = vocabulary;
  scope.update = {};
  scope.externalMode = externalMode;

  scope.cancel = () => {
    $mdDialog.hide();
  };

  scope.editingStatus = false;
  scope.toggleEdit = () => {
    scope.editingStatus = !scope.editingStatus;
  };

  scope.edit = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.edit.html',
      locals: {
        reference: reference,
        action: 'edit',
        vocabulary: vocabulary
      },
      multiple: true,
      clickOutToClose: false,
      controller: 'knowledgebase.references.edit'
    }).then(
      // Save Filters
      (result) => {
        if(result.status === 'update') {

          scope.reference = $kbUtils.processReferences(result.data);
          scope.reference = result.data;
          reference = scope.reference;

          $kb.history('reference', scope.reference.ident).then(
            (history) => {
              scope.history = history;
            },
            (err) => {
              console.log('Unable to retrieve updated history.');
            }
          );

          $mdToast.show($mdToast.simple({textContent: 'The entry has been updated'}));
        }
      },
      // Cancel
      () => {
        $mdToast.show($mdToast.simple({textContent: 'No changes were saved'}));
      }
    );
  };

  // Update Reference Status
  scope.updateStatus = () => {

    // Send status update
    $kb.references.status(scope.reference, scope.update.status, scope.update.comments).then(
      (result) => {
        // Update Result
        scope.reference.status = scope.update.status;
        scope.reference = $kbUtils.processReferences(result)[0];

        // Update History
        $kb.history('reference', scope.reference.ident).then(
          (history) => {
            scope.history = history;
          },
          (err) => {
            console.log('Unable to retrieve updated history.');
          }
        );

        scope.editingStatus = false;
        $mdToast.show($mdToast.simple({textContent: 'The entry has been updated'}));
      },
      (err) => {
        console.log('Unable to update reference status');
      }
    )

  }

}]);