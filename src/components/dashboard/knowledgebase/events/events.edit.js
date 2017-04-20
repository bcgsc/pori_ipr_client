app.controller('knowledgebase.events.edit',
['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.complete', 'api.pubmed', 'api.kb.associations', 'api.knowledgebase', 'api.user', 'action', 'event',
(_, $q, scope, $mdDialog, $mdToast, $complete, $pubmed, $kbAssoc, $kb, $user, action, event) => {

  scope.$alterations = $complete.get('alterations');
  scope.disableRefTitle = false;
  scope.event = angular.copy(event);
  scope.formAction = (action === 'new') ? 'Create' : 'Modify';
  scope.user = $user._me;
  scope.action = action;

  scope.events = {
    valid: false,
    dirty: true,
    pristine: true,
  };



  scope.submit = () => {
    scope.matching.$setSubmitted();

    if(!scope.matching.$valid) $mdToast.show($mdToast.simple({textContent:'Please check all the fields for errors'}));

    // All are valid
    if(scope.matching.$valid) {

      scope.reference.disease_list = _.join(scope.disease.all, ';');

      // Send updated entry to API
      if(action === 'new') {
        // Submit new entry
        $kb.references.create(scope.reference).then(
          (newEntry) => {
            $mdDialog.hide({status: 'new', data: newEntry});
          },
          (err) => {
            console.log('Unable to create entry', err);
            $mdToast.show($mdToast.simple({textContent: 'Unable to add new entry. Please try again. If this continues to fail, please leave feedback.'}));
          }
        )
      } else {
        // Update Existing Entry
        $kb.references.update(scope.reference).then(
          (updateEntry) => {
            console.log('Entry saved', updateEntry);
            $mdDialog.hide({status: 'update', data: updateEntry});
          },
          (err) => {
            console.log('Unable to update entry', err);
            $mdToast.show($mdToast.simple({textContent: 'Unable to update the entry. Please try again. If this continues to fail, please leave feedback.'}));
          }
        )
      }

    }
  };

  // Close Dialog
  scope.cancel = () => {
    $mdDialog.cancel('No changes have been made.');
  };


  // When the modal opens, watch for the events-expression value to load and validate it.
  scope.$watch('matching.key', (newval, oldval) => {

    // Are we transitioning from an empty form to a prefilled?
    if((oldval === undefined || oldval === null) && (newval !== undefined && newval !== null)) {
      scope.validateKBEvents();
    } else {
      // If not, are we just looking at a normal typing change?
      if(scope.events.pristine) scope.validateKBEvents();
    }

    // If the previous value was null/undefined, mark as no longer pristine.
    if(newval !== null && newval !== undefined) scope.events.pristine = false;
  });


  // Validate KB Events string
  scope.validateKBEvents = () => {
    scope.events.dirty = true;
    scope.events.valid = false;

    if(scope.event.key === '' || scope.event.key === undefined || scope.event.key === null) {
      scope.events.dirty = false;
      scope.events.valid = false;
      return;
    }

    // Try to validate
    $kb.validate.events(scope.event.key).then(
      (result) => {
        scope.events.dirty = false;
        scope.events.valid = true;

        // FIll out other fields
        scope.event.type = scope.event.key.split('_')[0];
        scope.event.name = scope.event.key.split('_')[1];
        scope.event.display_coord = scope.event.key.split('_')[2];

      },
      (err) => {
        scope.events.dirty = false;
        scope.events.valid = false;
      }
    )
  };

}]); // End controller
