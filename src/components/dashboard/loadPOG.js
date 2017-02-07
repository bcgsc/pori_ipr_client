app.controller('controller.dashboard.loadPOG',
  ['_', '$scope', '$mdDialog', 'api.pog', (_, scope, $mdDialog, $pog) => {

    scope.load = {pog: null}

    // Close Dialog
    scope.cancel = () => {
      $mdDialog.cancel('No changes have been made.');
    }

    // Update the specified entry
    scope.load = (f) => {

      // Check for valid inputs by touching each entry
      if(f.$invalid) {
        f.$setDirty();
        angular.forEach(f.$error, (field) => {
          angular.forEach(field, (errorField) => {
            errorField.$setTouched();
          });
        });
        return;
      }

      // Send updated entry to API
      $pog.load(scope.load.pog).then(
        (result) => {
          $mdDialog.hide('POG has been loaded.');
        },
        (error) => {
          alert('Unable to update. See console');
          console.log(error);
        }
      );

    } // End update

  }]) // End controller
