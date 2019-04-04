app.controller('knowledgebase.references.view',
  ['$q', '_', '$scope', '$mdDialog', '$mdToast', '$kbUtils', 'api.knowledgebase', 'reference', 'history', 'vocabulary', 'isExternalMode',
    ($q, _, scope, $mdDialog, $mdToast, $kbUtils, $kb, reference, history, vocabulary, isExternalMode) => {
      scope.reference = reference;
      scope.history = history;
      scope.vocabulary = vocabulary;
      scope.update = {};
      scope.externalMode = isExternalMode;

      scope.cancel = () => {
        $mdDialog.hide();
      };

      scope.editingStatus = false;
      scope.toggleEdit = () => {
        scope.editingStatus = !scope.editingStatus;
      };

      scope.edit = async ($event) => {
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/knowledgebase/references/references.edit.html',
          locals: {
            reference: reference,
            action: 'edit',
            vocabulary: vocabulary,
            isExternalMode: isExternalMode,
          },
          multiple: true,
          clickOutToClose: false,
          controller: 'knowledgebase.references.edit',
        }).then(async (result) => {
          if (result.status === 'update') {
            scope.reference = $kbUtils.processReferences(result.data)[0];
            reference = result.data;

            const kbHistory = await $kb.history('reference', scope.reference.ident);
            scope.history = kbHistory;

            $mdToast.show($mdToast.simple({ textContent: 'The entry has been updated' }));
          }
        },
          // Cancel
        () => {
          $mdToast.show($mdToast.simple({ textContent: 'No changes were saved' }));
        });
      };

      // Update Reference Status
      scope.updateStatus = async () => {
        try {
          // Send status update
          const statusUpdate = await $kb.references.status(reference, scope.update.status, scope.update.comments);

          // Update Result
          scope.reference = $kbUtils.processReferences(statusUpdate)[0];
          reference = statusUpdate;

          // Update History
          const kbHistory = await $kb.history('reference', scope.reference.ident);
          scope.history = kbHistory;

          scope.editingStatus = false;
          $mdToast.show($mdToast.simple({ textContent: 'The entry has been updated' }));
        } catch (err) {
          $mdToast.showSimple(`Reference status was not updated: ${err.data.error.message}`);
        }
      };
    }]);
